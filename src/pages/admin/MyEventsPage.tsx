import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Construction, PlusCircle } from 'lucide-react';

/**
 * Admin My Events Page
 *
 * BACKEND DEPENDENCY:
 * This page requires a creator-scoped listing endpoint that returns only
 * events the authenticated administrator is authorized to access.
 *
 * Required backend endpoint: GET /api/superadmin/events/mine
 * - Must use the authenticated user's identity (req.user.id) server-side
 * - Must return only events where createdBy matches the authenticated admin
 * - Must enforce authorization via the existing permission middleware
 *
 * The current GET /api/superadmin/events endpoint returns ALL events and
 * is NOT safe for this page. Browser-side filtering by createdBy is explicitly
 * prohibited by FE-06 requirements.
 *
 * Until the backend endpoint is available, this page displays a clear
 * backend-dependency state instead of unauthorized or fabricated event data.
 */

const MyEventsPage = () => {
  const { t } = useTranslation();

  return (
    <AdminLayout title={t('myEvents.title')}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight">
              {t('myEvents.title')}
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              {t('myEvents.description')}
            </p>
          </div>

          <Link
            to="/admin/events"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('myEvents.createNew')}</span>
          </Link>
        </div>

        {/* Backend Dependency Notice */}
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-2xl border border-line-soft shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-6">
            <Construction className="w-8 h-8 text-amber-600" />
          </div>

          <h2 className="text-xl font-serif font-bold text-ink mb-3">
            {t('myEvents.backendPendingTitle')}
          </h2>

          <p className="text-sm text-ink-soft max-w-md mx-auto mb-4 leading-relaxed">
            {t('myEvents.backendPendingDescription')}
          </p>

          <div className="p-4 bg-paper rounded-xl border border-line-soft max-w-lg mx-auto text-left">
            <p className="text-xs font-mono font-bold text-ink mb-2">
              {t('myEvents.requiredEndpoint')}
            </p>
            <p className="text-xs font-mono text-ink-soft break-all">
              GET /api/superadmin/events/mine
            </p>
            <ul className="mt-3 space-y-1.5">
              <li className="text-xs text-ink-soft flex items-start gap-2">
                <span className="text-crimsh-500 font-bold">•</span>
                <span>{t('myEvents.req1')}</span>
              </li>
              <li className="text-xs text-ink-soft flex items-start gap-2">
                <span className="text-crimsh-500 font-bold">•</span>
                <span>{t('myEvents.req2')}</span>
              </li>
              <li className="text-xs text-ink-soft flex items-start gap-2">
                <span className="text-crimsh-500 font-bold">•</span>
                <span>{t('myEvents.req3')}</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-ink-soft/60 mt-6 max-w-sm mx-auto italic">
            {t('myEvents.noDataMessage')}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MyEventsPage;
