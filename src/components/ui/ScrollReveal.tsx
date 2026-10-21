import { createElement, type ElementType, type ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

type ScrollRevealProps = {
  children: ReactNode;
  /** Extra classes for the rendered element. */
  className?: string;
  /** Stagger the reveal, in milliseconds. */
  delay?: number;
  /** Element to render. Defaults to a `div`. */
  as?: ElementType;
  threshold?: number;
  rootMargin?: string;
};

/**
 * Wraps content in a fade-up animation that plays when it scrolls into view.
 *
 * The `delay` prop makes it easy to stagger a group of siblings:
 *
 *   <ScrollReveal delay={0}>…</ScrollReveal>
 *   <ScrollReveal delay={120}>…</ScrollReveal>
 */
export const ScrollReveal = ({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
  threshold,
  rootMargin,
}: ScrollRevealProps) => {
  const { ref, isVisible } = useScrollReveal<HTMLElement>({
    threshold,
    rootMargin,
  });

  const classes = ['scroll-reveal', isVisible ? 'visible' : '', className]
    .filter(Boolean)
    .join(' ');

  return createElement(
    Tag,
    {
      ref,
      className: classes,
      style: delay ? { transitionDelay: `${delay}ms` } : undefined,
    },
    children
  );
};
