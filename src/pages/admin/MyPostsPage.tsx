import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/layouts/AdminLayout';
import { BloodCenterLayout } from '@/layouts/BloodCenterLayout';
import { ClipboardList } from 'lucide-react';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { myPostsService } from './services/myPostsService';
import type { MockEvent } from './services/myPostsService';
import { closeEvent } from './api/admin-api';
import { useDialog } from '@/context/DialogContext';
import {
  PlusCircle,
  Calendar,
  ExternalLink,
  Image as ImageIcon,
  Lock,
} from 'lucide-react';

const MyPostsPage = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { confirm, toast } = useDialog();

  // Blood center users get the blood center chrome, admins keep the admin chrome
  const isBloodCenter = location.pathname.startsWith('/blood-center');
  const Layout = isBloodCenter ? BloodCenterLayout : AdminLayout;
  const basePath = isBloodCenter ? '/blood-center' : '/admin';

  const [events, setEvents] = useState<MockEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await myPostsService.getMyPosts();
      setEvents(data);
    } catch (err: any) {
      setError(err?.message || t('myPosts.errorTitle'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCloseEvent = async (eventId: string, eventTitle: string) => {
    const ok = await confirm({
      title: t('myPosts.closeEventConfirmTitle'),
      message: t('myPosts.closeEventConfirmMessage', { title: eventTitle }),
      type: 'warning',
      confirmText: t('myPosts.closeBtn'),
    });
    if (!ok) return;

    try {
      setClosingId(eventId);
      await closeEvent(eventId);
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, status: 'closed' } : e))
      );
      toast.success(t('myPosts.closeEventSuccess'));
    } catch (err: any) {
      toast.error(typeof err === 'string' ? err : err?.message || t('myPosts.closeEventFailed'));
    } finally {
      setClosingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const locale = i18n.language === 'am' ? 'am-ET' : i18n.language === 'om' ? 'om-ET' : 'en-US';
      return date.toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <Layout title={isBloodCenter ? t('nav.bloodCenter.myEvents') : t('myPosts.title')} icon={<ClipboardList size={16} className="stroke-[1.75]" />}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight">
              {isBloodCenter ? t('nav.bloodCenter.myEvents') : t('myPosts.title')}
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              {isBloodCenter ? t('myPosts.bloodCenterDescription') : t('myPosts.description')}
            </p>
          </div>

          <Link
            to={`${basePath}/events`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('myPosts.createNew')}</span>
          </Link>
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
                to={`${basePath}/events`}
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
            {events.map((event) => {
              const isClosed = event.status === 'closed';

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden flex flex-col"
                >
                  {/* Media */}
                  {event.mediaUrl ? (
                    <div className="aspect-video bg-ink relative">
                      <img
                        src={event.mediaUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      {isClosed && (
                        <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                          <span className="px-3 py-1 bg-ink/80 text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/20 backdrop-blur-xs">
                            {t('myPosts.closedBadge')}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-paper flex items-center justify-center text-ink-soft/40 relative">
                      <ImageIcon className="w-10 h-10" />
                      {isClosed && (
                        <div className="absolute inset-0 bg-paper-dim/80 flex items-center justify-center">
                          <span className="px-3 py-1 bg-ink/80 text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-white/20">
                            {t('myPosts.closedBadge')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-serif font-bold text-ink leading-snug line-clamp-2">
                        {event.title}
                      </h3>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shrink-0 ml-2 ${
                          !isClosed
                            ? 'bg-verified/10 text-verified border border-verified/20'
                            : 'bg-red-50 text-crimson border border-crimson/30'
                        }`}
                      >
                        {!isClosed ? t('myPosts.statusOpen') : t('myPosts.statusClosed')}
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

                    {/* Action Bar */}
                    <div className="mt-auto pt-3 border-t border-line-soft flex items-center justify-between">
                      {!isClosed ? (
                        <>
                          <span className="text-[11px] text-verified font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-verified animate-pulse" />
                            {t('myPosts.acceptingDonors')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCloseEvent(event.id, event.title)}
                            disabled={closingId === event.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-paper hover:bg-crimson/10 text-crimson hover:text-crimson-dark border border-line-soft rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <Lock className="w-3 h-3" />
                            <span>{closingId === event.id ? t('myPosts.closingBtn') : t('myPosts.closeBtn')}</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-crimson">
                            <span className="w-2 h-2 rounded-full bg-crimson" />
                            {t('myPosts.closedBadge')}
                          </span>
                          <span className="text-[11px] text-ink-soft italic">{t('myPosts.noLongerAccepting')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyPostsPage;
