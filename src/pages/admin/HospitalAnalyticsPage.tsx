import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PieChart, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { fetchHospitalAnalytics } from './api/admin-api';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { HospitalAnalyticsData } from './models/hospital-analytics-types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const WeeklyTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md border border-line-soft rounded-2xl shadow-xl p-4 min-w-[230px] text-xs space-y-2.5">
      <div className="border-b border-line-soft pb-1.5 flex justify-between items-center">
        <span className="font-bold text-ink text-sm">Week of {item.weekLabel}</span>
        <span className="text-[10px] font-mono text-ink-soft">{item.week}</span>
      </div>

      <div className="space-y-1.5 font-sans">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-crimson">
            <span className="w-2.5 h-2.5 rounded-full bg-crimson inline-block" />
            Total Demand:
          </span>
          <span className="font-mono font-bold text-ink">{item.demand} units</span>
        </div>
        <div className="pl-4 text-[11px] text-ink-soft space-y-0.5">
          <div className="flex justify-between">
            <span>• Donor Requests:</span>
            <span className="font-mono font-medium text-ink">{item.donorDemand ?? 0} units</span>
          </div>
          <div className="flex justify-between">
            <span>• Blood Center:</span>
            <span className="font-mono font-medium text-ink">{item.bloodCenterDemand ?? 0} units</span>
          </div>
          <div className="flex justify-between text-verified font-medium">
            <span>• Fulfilled:</span>
            <span className="font-mono">{item.fulfilledDemand ?? 0} units</span>
          </div>
        </div>

        <div className="border-t border-line-soft/60 pt-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Available Supply:
          </span>
          <span className="font-mono font-bold text-ink">{item.supply} units</span>
        </div>
      </div>

      <div className="border-t border-line-soft/60 pt-1 text-[10px] text-ink-soft italic leading-snug">
        Fulfilled demand is portion of requested units successfully closed.
      </div>
    </div>
  );
};

const HospitalAnalyticsPage = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<HospitalAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBloodType, setSelectedBloodType] = useState<string>('ALL');

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

  const weeklyChartData = (data?.weeklyNeedVsSupply || []).map((item) => {
    if (selectedBloodType === 'ALL') {
      return {
        week: item.week,
        weekLabel: item.weekLabel,
        demand: item.demand,
        donorDemand: item.donorDemand,
        bloodCenterDemand: item.bloodCenterDemand,
        fulfilledDemand: item.fulfilledDemand,
        supply: item.supply,
      };
    }
    const btData = item.byBloodType?.[selectedBloodType] || {
      demand: 0,
      donorDemand: 0,
      bloodCenterDemand: 0,
      fulfilledDemand: 0,
      supply: 0,
    };
    return {
      week: item.week,
      weekLabel: item.weekLabel,
      demand: btData.demand,
      donorDemand: btData.donorDemand,
      bloodCenterDemand: btData.bloodCenterDemand,
      fulfilledDemand: btData.fulfilledDemand,
      supply: btData.supply,
    };
  });

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

            {/* Weekly Blood Need vs Available Supply Graph */}
            <div className="bg-white border border-line-soft rounded-[24px] shadow-sm p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-line-soft">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-crimson/10 text-crimson rounded-lg mt-0.5">
                    <Scale size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-ink">
                      {t('hospitalAnalytics.needVsSupplyTitle', 'Weekly Blood Need vs Available Supply')}
                    </h3>
                    <p className="text-xs font-sans text-ink-soft mt-0.5">
                      {t('hospitalAnalytics.needVsSupplySubtitle', 'Comparison between weekly requested blood quantities and available blood stock inventory.')}
                    </p>
                  </div>
                </div>

                {/* Blood Type Filter */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSelectedBloodType('ALL')}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      selectedBloodType === 'ALL'
                        ? 'bg-crimson text-white shadow-xs'
                        : 'bg-sand/40 hover:bg-sand/70 text-ink-soft hover:text-ink'
                    }`}
                  >
                    All Types
                  </button>
                  {BLOOD_TYPES.map((bt) => (
                    <button
                      key={bt}
                      type="button"
                      onClick={() => setSelectedBloodType(bt)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                        selectedBloodType === bt
                          ? 'bg-crimson text-white shadow-xs'
                          : 'bg-sand/40 hover:bg-sand/70 text-ink-soft hover:text-ink'
                      }`}
                    >
                      {bt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Metrics for selected filter */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-sand/20 rounded-2xl border border-line-soft/60">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                    {selectedBloodType === 'ALL' ? 'Total Demand (8 Wks)' : `${selectedBloodType} Demand (8 Wks)`}
                  </span>
                  <p className="text-lg font-serif font-bold text-crimson mt-0.5">
                    {weeklyChartData.reduce((acc, w) => acc + w.demand, 0)} <span className="text-xs font-sans font-normal text-ink-soft">units</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                    Fulfilled Requests
                  </span>
                  <p className="text-lg font-serif font-bold text-verified mt-0.5">
                    {weeklyChartData.reduce((acc, w) => acc + w.fulfilledDemand, 0)} <span className="text-xs font-sans font-normal text-ink-soft">units</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                    Current Week Stock
                  </span>
                  <p className="text-lg font-serif font-bold text-emerald-600 mt-0.5">
                    {weeklyChartData[weeklyChartData.length - 1]?.supply || 0} <span className="text-xs font-sans font-normal text-ink-soft">units</span>
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-soft">
                    Active Filter
                  </span>
                  <p className="text-lg font-serif font-bold text-ink mt-0.5">
                    {selectedBloodType === 'ALL' ? 'All Blood Types' : selectedBloodType}
                  </p>
                </div>
              </div>

              {weeklyChartData.length > 0 ? (
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyChartData}
                      margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="weekLabel"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                        dy={8}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        allowDecimals={false}
                        label={{ value: 'Units', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 11 } }}
                      />
                      <RechartsTooltip content={<WeeklyTooltip />} />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) =>
                          value === 'demand'
                            ? 'Blood Demand (Requested Units)'
                            : 'Available Supply (Inventory Units)'
                        }
                      />
                      <Bar
                        dataKey="demand"
                        name="demand"
                        fill="#C31F3B"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                      <Bar
                        dataKey="supply"
                        name="supply"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState
                  title={t('hospitalAnalytics.noData', 'No weekly analytics available.')}
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
