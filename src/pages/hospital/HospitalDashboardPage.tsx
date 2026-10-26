import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/layouts/DashboardLayout';
import { getHospitalDashboard } from '@/features/hospital/api/hospital-api';
import { getPendingDonationCount } from '@/pages/hospital/services/donationQueueService';
import { DonationQueueModal } from '@/pages/hospital/components/DonationQueueModal';
import { ALLOWED_BLOOD_TYPES } from '@/features/hospital/types/hospital-types';
import type { DashboardData } from '@/features/hospital/types/hospital-types';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { getStockClassification } from '@/utils/stockClassification';
import {
  LayoutDashboard,
  Building2,
  Droplets,
  Eye,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const HospitalDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [queueOpen, setQueueOpen] = useState<boolean>(false);

  /**
   * Lightweight dashboard check: how many pending donation records await
   * confirmation. Used only to show/hide the on-dashboard banner — it never
   * pulls full donor details just for the indicator.
   */
  const fetchPendingCount = async () => {
    try {
      const count = await getPendingDonationCount();
      setPendingCount(count);
    } catch (err) {
      console.warn('Failed to fetch pending donation count:', err);
      setPendingCount(0);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await getHospitalDashboard();
      setData(dashboardData);
    } catch (err: unknown) {
      let message = t('hospitalDashboard.loadFailed');
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchPendingCount();
  }, []);

  const rawData = (data as unknown as Record<string, unknown>) || {};
  const rawHospital =
    (rawData.hospital as Record<string, unknown>) ||
    (rawData.data as Record<string, unknown>) ||
    rawData;

  const hospitalName =
    (rawHospital.name as string) ||
    (rawHospital.hospitalName as string) ||
    (rawData.name as string) ||
    (rawData.hospitalName as string) ||
    t('hospitalDashboard.defaultName');

  const bloodStockMap =
    (rawData.bloodStock as Record<string, number>) ||
    (rawData.blood_stock as Record<string, number>) ||
    (rawData.stock as Record<string, number>) ||
    (rawHospital.bloodStock as Record<string, number>) ||
    {};

  return (
    <DashboardLayout
      icon={<LayoutDashboard size={16} className="stroke-[1.75]" />}
    >
      <div className="space-y-6">
        {/* Page Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-line-soft gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight">
              <span>{t('hospitalDashboard.title')}</span>
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              {t('hospitalDashboard.description')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/hospital/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl text-xs font-sans font-semibold transition-colors"
            >
              <Eye className="w-4 h-4 text-ink-soft stroke-[1.75]" />
              <span>{t('hospitalDashboard.viewProfile')}</span>
            </Link>

            <Link
              to="/hospital/blood-stock"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-sans font-semibold transition-colors shadow-xs"
            >
              <Droplets className="w-4 h-4 stroke-[1.75]" />
              <span>{t('hospitalDashboard.manageStock')}</span>
            </Link>

            <Link
              to="/hospital/faq"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft hover:text-crimson rounded-xl text-xs font-sans font-semibold transition-colors"
              title={t('nav.hospital.helpFaq')}
              aria-label={t('nav.hospital.helpFaq')}
            >
              <HelpCircle className="w-4 h-4 stroke-[1.75]" />
              <span className="hidden sm:inline">{t('nav.hospital.helpFaq')}</span>
            </Link>
          </div>
        </div>

        {/* Donation-history dashboard notification banner (PART 5) */}
        {pendingCount > 0 && (
          <div className="bg-crimson/5 border border-crimson/20 rounded-xl p-4 sm:p-6 flex items-center sm:flex-row justify-between gap-4 shadow-sm mb-6">
            <div className="flex items-center gap-3 sm:flex-1">
              <AlertCircle className="w-5 h-5 text-crimson shrink-0" />
              <div>
                <h3 className="font-serif font-bold text-ink text-sm sm:text-base leading-tight">
                  {t('dashboard.donationQueue.banner', { count: pendingCount })}
                </h3>
                <p className="text-xs text-ink-soft/80 leading-relaxed mt-0.5">
                  {t('dashboard.donationQueue.bannerDesc')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/hospital/medical-records', { state: { tab: 'waiting' } })}
              className="flex-shrink-0 px-4 py-2.5 bg-crimson text-white text-xs sm:text-sm font-sans font-bold rounded-xl hover:bg-crimson-dark transition-colors shadow-xs whitespace-nowrap"
            >
              {t('dashboard.donationQueue.viewQueue')}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-line-soft shadow-xs">
            <LoadingState text={t('hospitalDashboard.loading')} />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <ErrorState
            title={t('hospitalDashboard.errorTitle')}
            message={error}
            onRetry={fetchDashboard}
          />
        )}

        {!loading && !error && data && (
          <>
            {/* Rich Welcome Message Banner Card */}
            <div className="bg-gradient-to-r from-crimson via-crimson to-crimson-dark rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-2 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-red-100 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 stroke-[1.75]" />
                  <span>{t('hospitalDashboard.networkBadge')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-white shrink-0 stroke-[1.75]" />
                  <span>{t('hospitalDashboard.welcome', { name: hospitalName })}</span>
                </h2>
                <p className="text-sm font-sans text-red-100 max-w-2xl leading-relaxed">
                  {t('hospitalDashboard.welcomeDesc')}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 z-10">
                <Link
                  to="/hospital/blood-stock"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-crimson hover:bg-paper font-sans font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  <Droplets className="w-4 h-4 text-crimson stroke-[1.75]" />
                  <span>{t('hospitalDashboard.updateInventory')}</span>
                </Link>
              </div>
            </div>

            

              {/* Blood Stock Summary Card */}
              <div className="bg-white rounded-2xl border border-line-soft shadow-xs p-6 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-line-soft pb-3">
                  <div>
                    <h2 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-crimson stroke-[1.75]" />
                      <span>{t('hospitalDashboard.stockSummary')}</span>
                    </h2>
                    <p className="text-xs font-sans text-ink-soft mt-0.5">
                      {t('hospitalDashboard.stockSummaryDesc')}
                    </p>
                  </div>
                  <Link
                    to="/hospital/blood-stock"
                    className="text-xs font-mono font-bold uppercase tracking-wider text-crimson hover:underline px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {t('hospitalDashboard.manageStockLink')} &rarr;
                  </Link>
                </div>

                {/* 8 Blood Types Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {ALLOWED_BLOOD_TYPES.map((type) => {
                    const quantity = bloodStockMap[type] ?? 0;
                    const stockClass = getStockClassification(quantity);

                    return (
                      <div
                        key={type}
                        className={`p-4 rounded-xl border transition-all ${
                          stockClass.level === 'low'
                            ? 'bg-crimson/5 border-crimson/20 shadow-xs'
                            : stockClass.level === 'limited'
                            ? 'bg-amber-50/50 border-amber-200/60'
                            : 'bg-paper/60 border-line-soft hover:border-line'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-ink bg-white px-2.5 py-0.5 rounded border border-line-soft">
                            {type}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${stockClass.badgeClass}`}
                          >
                            {t(stockClass.labelKey, stockClass.defaultLabel)}
                          </span>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                          <span className="text-2xl font-serif font-bold text-ink tracking-tight">
                            {quantity}
                          </span>
                          <span className="text-xs font-mono text-ink-soft font-medium">{t('hospitalDashboard.units')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
          </>
        )}
      </div>

      <DonationQueueModal
        open={queueOpen}
        onClose={() => setQueueOpen(false)}
        onCountRefresh={fetchPendingCount}
      />
    </DashboardLayout>
  );
};

export default HospitalDashboardPage;