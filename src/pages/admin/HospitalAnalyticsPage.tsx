import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PieChart } from 'lucide-react';
import { fetchHospitalAnalytics } from './api/admin-api';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { HospitalAnalyticsData } from './models/hospital-analytics-types';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COLORS = ['#C31F3B', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

const HospitalAnalyticsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<HospitalAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHospitalAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err || 'Failed to fetch hospital analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <AdminLayout
        title={t('hospitalAnalytics.title')}
        icon={<PieChart size={16} className="stroke-[1.75]" />}
      >
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-line-soft bg-white shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-16 w-56 h-56 rounded-full bg-crimson/[0.07] blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-sand/50 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-ink">{t('hospitalAnalytics.title')}</h2>
            <p className="text-ink-soft">{t('hospitalAnalytics.description')}</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-[32px] border border-line-soft shadow-xs p-8">
            <LoadingState text={t('hospitalAnalytics.loading')} />
          </div>
        ) : error ? (
          <ErrorState
            title={t('hospitalAnalytics.errorTitle')}
            message={error}
            retryLabel={t('hospitalAnalytics.retry')}
            onRetry={loadAnalytics}
          />
        ) : data ? (
          <>
            {/* National Totals */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {BLOOD_TYPES.map((bt) => (
                <div key={bt} className="bg-white border border-line-soft rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-crimson/10 text-crimson flex items-center justify-center font-bold text-lg mb-2">
                    {bt}
                  </div>
                  <span className="text-2xl font-serif font-bold text-ink">
                    {data.nationalTotals?.[bt] || 0}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-ink-soft uppercase tracking-widest mt-1">
                    {t('hospitalAnalytics.units')}
                  </span>
                </div>
              ))}
            </div>

            {/* Top & Bottom Hospitals */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white border border-line-soft rounded-[24px] shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line-soft">
                  <div className="p-2 bg-verified/10 text-verified rounded-lg"><TrendingUp size={20} /></div>
                  <h3 className="text-lg font-serif font-bold text-ink">{t('hospitalAnalytics.topFacilities')}</h3>
                </div>
                <div className="space-y-4">
                  {(data.topHospitals || []).map((h, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-ink-soft/40 w-4">{idx + 1}.</span>
                        <div>
                          <p className="font-bold text-ink">{h.hospitalName}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-crimson bg-crimson/5 px-3 py-1 rounded-full text-sm">
                        {h.totalUnits || 0} {t('hospitalAnalytics.units')}
                      </span>
                    </div>
                  ))}
                  {(!data.topHospitals || data.topHospitals.length === 0) && (
                    <p className="text-sm text-ink-soft italic">{t('hospitalAnalytics.noData')}</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-line-soft rounded-[24px] shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line-soft">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><TrendingDown size={20} /></div>
                  <h3 className="text-lg font-serif font-bold text-ink">{t('hospitalAnalytics.bottomFacilities')}</h3>
                </div>
                <div className="space-y-4">
                  {(data.bottomHospitals || []).map((h, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-ink-soft/40 w-4">{idx + 1}.</span>
                        <div>
                          <p className="font-bold text-ink">{h.hospitalName}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-600 bg-amber-500/5 px-3 py-1 rounded-full text-sm">
                        {h.totalUnits || 0} {t('hospitalAnalytics.units')}
                      </span>
                    </div>
                  ))}
                  {(!data.bottomHospitals || data.bottomHospitals.length === 0) && (
                    <p className="text-sm text-ink-soft italic">{t('hospitalAnalytics.noData')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Trends Chart */}
            <div className="bg-white border border-line-soft rounded-[24px] shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line-soft">
                <div className="p-2 bg-crimson/10 text-crimson rounded-lg"><Activity size={20} /></div>
                <h3 className="text-lg font-serif font-bold text-ink">{t('hospitalAnalytics.trendsTitle')}</h3>
              </div>

              {data.trends && data.trends.length > 0 ? (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <RechartsTooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                      {BLOOD_TYPES.map((bt, idx) => (
                        <Line
                          key={bt}
                          type="monotone"
                          dataKey={bt}
                          name={bt}
                          stroke={COLORS[idx]}
                          strokeWidth={2}
                          dot={{ r: 3, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title={t('hospitalAnalytics.noTrends')}
                />
              )}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default HospitalAnalyticsPage;
