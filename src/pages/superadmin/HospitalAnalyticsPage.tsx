import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { fetchHospitalAnalytics } from '../admin/api/admin-api';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6'];

const HospitalAnalyticsPage = () => {
  const [data, setData] = useState<any>(null);
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
    <AdminLayout title="Hospital Analytics">
      <div className="space-y-8">
        <div className="bg-crimson rounded-3xl p-8 text-paper shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-crimson/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-serif font-bold tracking-tight">National Blood Analytics</h2>
            <p>Comprehensive insights and trends across all medical facilities.</p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-[32px] border border-line-soft shadow-xs p-8">
            <LoadingState text="Compiling analytics..." />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load analytics" message={error} onRetry={loadAnalytics} />
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
                    Units
                  </span>
                </div>
              ))}
            </div>

            {/* Top & Bottom Hospitals */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white border border-line-soft rounded-[24px] shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line-soft">
                  <div className="p-2 bg-verified/10 text-verified rounded-lg"><TrendingUp size={20} /></div>
                  <h3 className="text-lg font-serif font-bold text-ink">Top 10 Facilities (Stock)</h3>
                </div>
                <div className="space-y-4">
                  {(data.topHospitals || []).map((h: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-ink-soft/40 w-4">{idx + 1}.</span>
                        <div>
                          <p className="font-bold text-ink">{h.hospitalName}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-crimson bg-crimson/5 px-3 py-1 rounded-full text-sm">
                        {h.totalUnits || 0} U
                      </span>
                    </div>
                  ))}
                  {(!data.topHospitals || data.topHospitals.length === 0) && (
                     <p className="text-sm text-ink-soft italic">No data available.</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-line-soft rounded-[24px] shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line-soft">
                  <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg"><TrendingDown size={20} /></div>
                  <h3 className="text-lg font-serif font-bold text-ink">Bottom 10 Facilities (Stock)</h3>
                </div>
                <div className="space-y-4">
                  {(data.bottomHospitals || []).map((h: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-mono font-bold text-ink-soft/40 w-4">{idx + 1}.</span>
                        <div>
                          <p className="font-bold text-ink">{h.hospitalName}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-amber-600 bg-amber-500/5 px-3 py-1 rounded-full text-sm">
                        {h.totalUnits || 0} U
                      </span>
                    </div>
                  ))}
                  {(!data.bottomHospitals || data.bottomHospitals.length === 0) && (
                     <p className="text-sm text-ink-soft italic">No data available.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Trends Chart */}
            <div className="bg-white border border-line-soft rounded-[24px] shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-line-soft">
                <div className="p-2 bg-crimson/10 text-crimson rounded-lg"><Activity size={20} /></div>
                <h3 className="text-lg font-serif font-bold text-ink">Supply Trends (30 Days)</h3>
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
                <div className="py-20 text-center">
                  <p className="text-ink-soft font-serif italic text-lg">No trend data available.</p>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default HospitalAnalyticsPage;
