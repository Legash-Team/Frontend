import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Database } from 'lucide-react';
import { fetchHospitalStock } from './api/admin-api';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import type { HospitalStockItem } from './models/hospital-stock-types';
import { Filter, ArrowUpDown } from 'lucide-react';
import { LocationLink } from '@/utils/mapsUrl';
import { getStockClassification } from '@/utils/stockClassification';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const HospitalStockPage = () => {
  const { t } = useTranslation();
  const [stock, setStock] = useState<HospitalStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bloodType, setBloodType] = useState('');
  const [sortBy, setSortBy] = useState('');

  const loadStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchHospitalStock(bloodType, sortBy);
      if (res.success) {
        setStock(res.data || []);
      } else {
        setStock([]);
      }
    } catch (err: any) {
      setError(err || 'Failed to fetch hospital stock.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
  }, [bloodType, sortBy]);

  return (
    <AdminLayout
        title={t('hospitalStock.title')}
        icon={<Database size={16} className="stroke-[1.75]" />}
      >
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-line-soft bg-white shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-10 -bottom-16 w-56 h-56 rounded-full bg-crimson/[0.07] blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-48 h-48 rounded-full bg-sand/50 blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-ink">{t('hospitalStock.title')}</h2>
            <p className="text-ink-soft">{t('hospitalStock.description')}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[24px] border border-line-soft shadow-sm">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft w-4 h-4" />
              <select
                className="w-full pl-9 pr-4 py-2 bg-paper border border-line-soft rounded-xl text-sm outline-none focus:border-crimson appearance-none"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
              >
                <option value="">{t('hospitalStock.filterAllTypes')}</option>
                {BLOOD_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 sm:w-56">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft w-4 h-4" />
              <select
                className="w-full pl-9 pr-4 py-2 bg-paper border border-line-soft rounded-xl text-sm outline-none focus:border-crimson appearance-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="">{t('hospitalStock.filterDefaultSort')}</option>
                <option value="units_desc">{t('hospitalStock.sortUnitsDesc')}</option>
                <option value="units_asc">{t('hospitalStock.sortUnitsAsc')}</option>
                <option value="name_asc">{t('hospitalStock.sortNameAsc')}</option>
                <option value="name_desc">{t('hospitalStock.sortNameDesc')}</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-[32px] border border-line-soft shadow-xs p-8">
            <LoadingState text={t('hospitalStock.loading')} />
          </div>
        ) : error ? (
          <ErrorState
            title={t('hospitalStock.errorTitle')}
            message={error}
            retryLabel={t('hospitalStock.retry')}
            onRetry={loadStock}
          />
        ) : stock.length === 0 ? (
          <EmptyState
            title={t('hospitalStock.emptyMessage')}
          />
        ) : (
          <div className="bg-white border border-line-soft rounded-[24px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-paper/50 border-b border-line-soft">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">{t('hospitalStock.colHospital')}</th>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">{t('hospitalStock.colLocation')}</th>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">{t('hospitalStock.colPhone')}</th>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">{t('hospitalStock.colBloodType')}</th>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest text-right">{t('hospitalStock.colUnits')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {stock.map((item, idx) => (
                    <tr key={idx} className="hover:bg-paper/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-serif font-bold text-ink">{item.hospitalName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <LocationLink location={item.location} className="text-sm" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-ink-soft">{item.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-ink">{item.bloodType || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(() => {
                          const stockClass = getStockClassification(item.availableUnits);
                          return (
                            <div className="inline-flex items-center gap-2">
                              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${stockClass.badgeClass}`}>
                                {t(stockClass.labelKey, stockClass.defaultLabel)}
                              </span>
                              <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full border font-bold font-mono text-sm ${stockClass.badgeClass}`}>
                                {item.availableUnits || 0} {t('hospitalAnalytics.units')}
                              </div>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default HospitalStockPage;
