import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  fetchHelpCenterFaqs,
  type HelpCenterFaqItem,
} from '@/api/helpCenterApi';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import {
  HelpCircle,
  Search,
  ChevronDown,
  X,
  Mail,
  Bot,
  BookOpen,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const HelpCenterPage: React.FC = () => {
  const { user } = useAuth();
  const isHospital = user?.role === 'hospital';

  const [faqs, setFaqs] = useState<HelpCenterFaqItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load FAQ data dynamically from backend
  const loadFaqs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHelpCenterFaqs();
      setFaqs(data);
      // Auto-expand first item if available for friendly user onboarding
      if (data.length > 0) {
        setExpandedIds(new Set([data[0].id]));
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to retrieve FAQs from the Help Center server. Please verify network connectivity and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  // Toggle accordion item expansion
  const toggleFaq = (id: string | number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFaqs.map((item) => item.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  // Derive unique categories if provided by backend items
  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((faq) => {
      if (faq.category && faq.category.trim()) {
        set.add(faq.category.trim());
      }
    });
    return Array.from(set);
  }, [faqs]);

  // Filter FAQs based on search query and category
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        faq.category?.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCategory) return false;

      if (!q) return true;

      const inQuestion = faq.question.toLowerCase().includes(q);
      const inAnswer = faq.answer.toLowerCase().includes(q);
      const inCategory = faq.category?.toLowerCase().includes(q);

      return inQuestion || inAnswer || inCategory;
    });
  }, [faqs, searchQuery, selectedCategory]);

  const allExpanded =
    filteredFaqs.length > 0 &&
    filteredFaqs.every((item) => expandedIds.has(item.id));

  // The core Help Center content
  const pageContent = (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson/10 border border-crimson/20 text-crimson text-xs font-mono font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Help & Knowledge Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-ink tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-ink-soft max-w-2xl mx-auto leading-relaxed">
          Explore answers to common questions about the Legash platform, emergency blood requests,
          hospital facility management, donor communications, and account security.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-line-soft shadow-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft/50" />
          <input
            id="faq-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword or topic..."
            className="w-full pl-10 pr-10 py-2.5 text-sm font-sans bg-paper rounded-xl border border-line-soft focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson text-ink placeholder:text-ink-soft/40 transition-all"
            aria-label="Search FAQs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-soft/50 hover:text-ink transition-colors"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-line-soft/60">
          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all ${
                  selectedCategory === 'All'
                    ? 'bg-crimson text-white shadow-xs'
                    : 'bg-paper text-ink-soft hover:bg-paper-dim hover:text-ink'
                }`}
              >
                All ({faqs.length})
              </button>
              {categories.map((cat) => {
                const count = faqs.filter(
                  (f) => f.category?.toLowerCase() === cat.toLowerCase()
                ).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-sans font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-crimson text-white shadow-xs'
                        : 'bg-paper text-ink-soft hover:bg-paper-dim hover:text-ink'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Expand / Collapse / Refresh actions */}
          <div className="flex items-center gap-2 ml-auto">
            {filteredFaqs.length > 0 && (
              <button
                type="button"
                onClick={allExpanded ? collapseAll : expandAll}
                className="text-xs font-sans font-medium text-ink-soft hover:text-crimson transition-colors px-2 py-1"
              >
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </button>
            )}
            <button
              type="button"
              onClick={loadFaqs}
              disabled={isLoading}
              title="Refresh FAQs from server"
              className="p-1.5 text-ink-soft/70 hover:text-crimson rounded-lg hover:bg-paper transition-colors"
              aria-label="Refresh FAQs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Loading, Error, Empty, or Accordion */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingState text="Loading Help Center FAQs..." />
          {/* Skeleton Placeholders */}
          <div className="space-y-3 opacity-60 pointer-events-none">
            {[1, 2, 3].map((placeholder) => (
              <div
                key={placeholder}
                className="bg-white p-5 rounded-2xl border border-line-soft animate-pulse space-y-2.5"
              >
                <div className="h-4 bg-paper-dim rounded-md w-3/4" />
                <div className="h-3 bg-paper-dim rounded-md w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="space-y-4">
          <ErrorState
            title="Unable to Load FAQ Data"
            message={error}
            onRetry={loadFaqs}
            retryLabel="Retry Connection"
          />
          <div className="p-4 bg-white rounded-xl border border-line-soft text-xs text-ink-soft space-y-1.5">
            <p className="font-semibold text-ink">Troubleshooting:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Ensure the backend server is reachable at <code className="font-mono text-crimson">/api/help-center/faq</code>.</li>
              <li>Check your network connection and reload the page.</li>
              <li>For immediate assistance, contact support below.</li>
            </ul>
          </div>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="w-8 h-8 text-ink-soft/60" />}
          title={searchQuery ? 'No matching questions found' : 'No FAQs Available'}
          description={
            searchQuery
              ? `No FAQ questions matched "${searchQuery}". Please try using different keywords or clear your query.`
              : 'There are currently no frequently asked questions in the Help Center.'
          }
          action={
            searchQuery ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Clear Search Query
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={loadFaqs}
              >
                Refresh Data
              </Button>
            )
          }
        />
      ) : (
        /* FAQ Accordion List */
        <div className="space-y-3" role="region" aria-label="Frequently Asked Questions Accordion">
          {filteredFaqs.map((faq) => {
            const isOpen = expandedIds.has(faq.id);
            const contentId = `faq-answer-${faq.id}`;
            const headerId = `faq-header-${faq.id}`;

            return (
              <div
                key={faq.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-crimson/40 shadow-sm'
                    : 'border-line-soft hover:border-line'
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  id={headerId}
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson"
                >
                  <div className="flex-1 space-y-1.5">
                    {faq.category && (
                      <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-paper text-ink-soft">
                        {faq.category}
                      </span>
                    )}
                    <h2 className="text-sm sm:text-base font-serif font-bold text-ink leading-snug">
                      {faq.question}
                    </h2>
                  </div>

                  {/* Expand / Collapse Chevron */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-crimson/10 text-crimson rotate-180'
                        : 'bg-paper text-ink-soft hover:bg-paper-dim'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                {/* Collapsible Answer Body */}
                {isOpen && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="px-4 sm:px-5 pb-5 pt-1 border-t border-line-soft/50 text-xs sm:text-sm text-ink-soft leading-relaxed space-y-2 animate-in fade-in-50 duration-150"
                  >
                    {faq.answer.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* "Still Need Help?" Contact & Support Footer Card */}
      <div className="mt-12 bg-gradient-to-br from-paper via-white to-paper-dim border border-line-soft rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-ink">
              Still have questions?
            </h3>
            <p className="text-xs sm:text-sm text-ink-soft max-w-md leading-relaxed">
              Our support team is on standby to assist verified medical facilities and donor network participants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="mailto:contact@legash.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink hover:bg-ink-soft text-white text-xs font-sans font-bold transition-all shadow-xs"
            >
              <Mail className="w-4 h-4" />
              <span>Email Support</span>
            </a>

            {isHospital && (
              <Link
                to="/ai-chat"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-crimson hover:bg-crimson-dark text-white text-xs font-sans font-bold transition-all shadow-xs"
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-line-soft flex flex-wrap items-center justify-between gap-3 text-xs text-ink-soft/70">
          <span>Official Legash Blood Infrastructure Support</span>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-crimson transition-colors">
              Terms & Privacy
            </Link>
            <span>•</span>
            <a
              href="mailto:contact@legash.com"
              className="hover:text-crimson transition-colors"
            >
              contact@legash.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // If the user is logged in as hospital, render inside the hospital DashboardLayout.
  // Otherwise, render inside public layout with Navbar and Footer.
  if (isHospital) {
    return <DashboardLayout>{pageContent}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 pt-[76px]">{pageContent}</main>
      <Footer />
    </div>
  );
};

export default HelpCenterPage;
