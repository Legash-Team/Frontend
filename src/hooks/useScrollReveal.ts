import { useEffect, useRef, useState } from 'react';

type ScrollRevealOptions = {
  /** How much of the element must be visible before it reveals. */
  threshold?: number;
  /** Shrinks the observer viewport so items reveal slightly after entering. */
  rootMargin?: string;
  /** Disconnect after the first reveal. */
  once?: boolean;
};

/**
 * Observes an element and reports when it has scrolled into view.
 *
 * Handles the edge cases that otherwise leave content permanently hidden:
 * - elements that are already above the viewport when the page is restored
 *   to a previous scroll position
 * - browsers without IntersectionObserver
 * - users who prefer reduced motion (content is revealed immediately)
 */
export const useScrollReveal = <T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  // The large top margin makes elements that are already above the viewport
  // count as intersecting. Without it, reloading half-way down the page would
  // leave everything above the restored scroll position invisible forever.
  rootMargin = '100000px 0px -60px 0px',
  once = true,
}: ScrollRevealOptions = {}) => {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    // Deferred to the end of the current task so the initial paint still shows
    // the "hidden" state and the fade-up transition can play. A microtask is
    // used instead of requestAnimationFrame because rAF is paused in background
    // tabs, which would leave content hidden until the tab is focused.
    const reveal = () => {
      if (!cancelled) {
        setIsVisible(true);
      }
    };

    const scheduleReveal = () => {
      queueMicrotask(reveal);
    };

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      scheduleReveal();
      return () => {
        cancelled = true;
      };
    }

    // If the element is already inside (or above) the viewport when it mounts,
    // reveal it without waiting for the observer. This covers reloads that
    // restore a previous scroll position and keeps content visible if the
    // observer is throttled.
    if (element.getBoundingClientRect().top < window.innerHeight) {
      scheduleReveal();
      return () => {
        cancelled = true;
      };
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          reveal();

          if (once) {
            observer?.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { ref, isVisible };
};
