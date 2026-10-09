import { useState, useEffect } from 'react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { fetchHospitalStock } from '../admin/api/admin-api';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Filter, ArrowUpDown } from 'lucide-react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SORT_OPTIONS = [
  { label: 'Available Units (High to Low)', value: 'units_desc' },
  { label: 'Available Units (Low to High)', value: 'units_asc' },
  { label: 'Hospital Name (A-Z)', value: 'name_asc' },
  { label: 'Hospital Name (Z-A)', value: 'name_desc' }
];

const HospitalStockPage = () => {
  const [stock, setStock] = useState<any[]>([]);
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
    <AdminLayout title="Hospital Stock">
      <div className="space-y-8">
        <div className="bg-crimson rounded-3xl p-8 text-paper shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-crimson/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-serif font-bold tracking-tight">Hospital Stock Monitoring</h2>
            <p>Monitor blood availability across all registered facilities.</p>
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
                <option value="">All Blood Types</option>
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
                <option value="">Default Sort</option>
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-[32px] border border-line-soft shadow-xs p-8">
            <LoadingState text="Loading hospital stock..." />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load stock" message={error} onRetry={loadStock} />
        ) : stock.length > 0 ? (
          <div className="bg-white border border-line-soft rounded-[24px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-paper/50 border-b border-line-soft">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">Hospital Name</th>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">Location</th>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">Phone</th>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest">Blood Type</th>
                    <th className="px-6 py-4 text-[10px] font-mono font-bold text-ink-soft uppercase tracking-widest text-right">Available Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {stock.map((item, idx) => (
                    <tr key={idx} className="hover:bg-paper/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-serif font-bold text-ink">{item.hospitalName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-ink-soft">{item.location?.address || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-ink-soft">{item.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-ink">{item.bloodType || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-crimson/10 text-crimson font-bold font-mono text-sm">
                          {item.availableUnits || 0} Units
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-[32px] border border-dashed border-line-soft">
            <p className="text-ink-soft font-serif italic text-lg">No stock data available.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default HospitalStockPage;
