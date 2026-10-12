import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { myPostsService } from './services/myPostsService';
import type { MockEvent } from './services/myPostsService';
import {
  PlusCircle,
  Calendar,
  ExternalLink,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';

const MyPostsPage = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await myPostsService.getMyPosts();
      setEvents(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <AdminLayout title="My Posts">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight">
              {t('myPosts.title')}
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              {t('myPosts.description')}
            </p>
          </div>

          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('myPosts.createNew')}</span>
          </Link>
        </div>

        {/* Development Data Notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {t('myPosts.devDataTitle')}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {t('myPosts.devDataDescription')}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-line-soft shadow-xs">
            <LoadingState text={t('myPosts.loading')} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            title={t('myPosts.errorTitle')}
            message={error}
            onRetry={fetchPosts}
            retryLabel={t('myPosts.retry')}
          />
        )}

        {/* Empty State */}
        {!loading && !error && events.length === 0 && (
          <EmptyState
            icon={<PlusCircle className="w-6 h-6" />}
            title={t('myPosts.emptyTitle')}
            description={t('myPosts.emptyDescription')}
            action={
              <Link
                to="/admin/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('myPosts.createFirst')}</span>
              </Link>
            }
          />
        )}

        {/* Populated State */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden flex flex-col"
              >
                {/* Media */}
                {event.mediaUrl ? (
                  <div className="aspect-video bg-ink">
                    <img
                      src={event.mediaUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-paper flex items-center justify-center text-ink-soft/40">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-serif font-bold text-ink leading-snug line-clamp-2">
                      {event.title}
                    </h3>
                    <span
                      className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                        event.status === 'open'
                          ? 'bg-verified/10 text-verified border border-verified/20'
                          : 'bg-paper-dim text-ink-soft border border-line-soft'
                      }`}
                    >
                      {event.status === 'open' ? t('myPosts.statusOpen') : t('myPosts.statusClosed')}
                    </span>
                  </div>

                  <p className="text-xs text-ink-soft line-clamp-3 mb-3 leading-relaxed">
                    {event.description.replace(/<[^>]*>/g, '')}
                  </p>

                  <div className="space-y-2 text-[11px] text-ink-soft mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-ink-soft/50" />
                      <span>{t('myPosts.created')}: {formatDate(event.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-crimson/70" />
                      <span>{t('myPosts.closes')}: {formatDate(event.closesAt)}</span>
                    </div>
                    {event.applyLink && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5 text-crimson" />
                        <a
                          href={event.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-crimson hover:underline truncate"
                        >
                          {event.applyLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MyPostsPage;
