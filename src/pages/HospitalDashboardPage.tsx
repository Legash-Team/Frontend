import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { getHospitalDashboard } from '@/api/hospital-api';
import { ALLOWED_BLOOD_TYPES } from '../types/hospital-types';
import type { DashboardData, LocationData } from '../types/hospital-types';
import {
  LayoutDashboard,
  Building2,
  Droplets,
  MapPin,
  AlertTriangle,
  RefreshCw,
  Eye,
  Pencil,
  Sparkles,
} from 'lucide-react';

export const HospitalDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboardData = await getHospitalDashboard();
      setData(dashboardData);
    } catch (err: unknown) {
      let message = 'Failed to load hospital dashboard data.';
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
    'Medical Facility';

  const hospitalEmail =
    (rawHospital.email as string) ||
    (rawData.email as string) ||
    'N/A';

  const hospitalPhone =
    (rawHospital.phone as string) ||
    (rawData.phone as string) ||
    'N/A';

  const hospitalLicense =
    (rawHospital.licenseNumber as string) ||
    (rawHospital.license_number as string) ||
    (rawData.licenseNumber as string) ||
    (rawData.license_number as string) ||
    'N/A';

  const hospitalLocation =
    (rawHospital.location as LocationData | null) ||
    (rawData.location as LocationData | null) ||
    null;

  const bloodStockMap =
    (rawData.bloodStock as Record<string, number>) ||
    (rawData.blood_stock as Record<string, number>) ||
    (rawData.stock as Record<string, number>) ||
    (rawHospital.bloodStock as Record<string, number>) ||
    {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-line-soft gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <LayoutDashboard className="w-6 h-6 text-crimson stroke-[1.75]" />
              <span>Hospital Dashboard</span>
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              Live Overview of Facility Information and Emergency Blood Inventory.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/hospital/profile"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-paper hover:bg-paper-dim border border-line-soft text-ink-soft rounded-xl text-xs font-sans font-semibold transition-colors"
            >
              <Eye className="w-4 h-4 text-ink-soft stroke-[1.75]" />
              <span>View Profile</span>
            </Link>

            <Link
              to="/hospital/blood-stock"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-crimson hover:bg-crimson-dark text-white rounded-xl text-xs font-sans font-semibold transition-colors shadow-xs"
            >
              <Droplets className="w-4 h-4 stroke-[1.75]" />
              <span>Manage Blood Stock</span>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-line-soft shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-crimson border-t-transparent"></div>
            <p className="mt-3 text-sm font-sans text-ink-soft font-medium">Loading hospital dashboard...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-crimson/5 border border-crimson/20 rounded-xl p-4 text-ink text-sm flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-crimson shrink-0 stroke-[1.75]" />
              <div>
                <p className="font-serif font-bold text-ink">Unable to fetch dashboard</p>
                <p className="text-crimson text-xs mt-0.5 font-sans">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchDashboard}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-crimson/10 hover:bg-crimson/20 text-crimson px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Rich Welcome Message Banner Card */}
            <div className="bg-gradient-to-r from-crimson via-crimson to-crimson-dark rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-2 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-mono font-bold uppercase tracking-wider text-red-100 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 stroke-[1.75]" />
                  <span>Legash Emergency blood Network</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white flex items-center gap-3">
                  <Building2 className="w-7 h-7 text-white shrink-0 stroke-[1.75]" />
                  <span>Welcome, {hospitalName}</span>
                </h2>
                <p className="text-sm font-sans text-red-100 max-w-2xl leading-relaxed">
                  Monitor live blood inventory, request emergency transfers, and manage facility contact information in real-time.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 z-10">
                <Link
                  to="/hospital/blood-stock"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-crimson hover:bg-paper font-sans font-bold rounded-xl text-xs transition-all shadow-sm"
                >
                  <Droplets className="w-4 h-4 text-crimson stroke-[1.75]" />
                  <span>Update Blood Inventory</span>
                </Link>
              </div>
            </div>

            {/* Dashboard Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hospital Information Card (Read-Only) */}
              <div className="bg-white rounded-2xl border border-line-soft shadow-xs p-6 lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between border-b border-line-soft pb-3">
                  <h2 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-crimson stroke-[1.75]" />
                    <span>Hospital Info</span>
                  </h2>
                  <Link
                    to="/hospital/profile/edit"
                    className="text-xs font-mono font-bold uppercase tracking-wider text-crimson hover:underline flex items-center gap-1"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </Link>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider block">
                      Hospital Name
                    </span>
                    <p className="text-ink font-bold font-sans mt-0.5">{hospitalName}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider block">
                      Email Address
                    </span>
                    <p className="text-ink font-medium font-sans mt-0.5">{hospitalEmail}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider block">
                      Phone Number
                    </span>
                    <p className="text-ink font-medium font-sans mt-0.5">{hospitalPhone}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider block">
                      License / Reg. Number
                    </span>
                    <p className="text-ink font-mono font-semibold mt-0.5">
                      {hospitalLicense}
                    </p>
                  </div>

                  {/* Location Indicator */}
                  <div className="pt-3 border-t border-line-soft">
                    <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider block mb-1.5">
                      Location Pin
                    </span>
                    {hospitalLocation ? (
                      <div className="p-3 bg-crimson/5 border border-crimson/15 rounded-xl flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-crimson shrink-0 mt-0.5 stroke-[1.75]" />
                        <div>
                          <p className="text-xs font-serif font-bold text-ink">Registered Geolocation</p>
                          <p className="text-xs text-ink-soft mt-0.5 font-mono">
                            Lat: {hospitalLocation.lat} | Lng: {hospitalLocation.lng}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-paper border border-line-soft rounded-xl text-xs text-ink-soft flex items-center gap-2 font-sans">
                        <MapPin className="w-4 h-4 text-ink-soft/60 stroke-[1.75]" />
                        <span>No geographical coordinates registered.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Blood Stock Summary Card */}
              <div className="bg-white rounded-2xl border border-line-soft shadow-xs p-6 lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-line-soft pb-3">
                  <div>
                    <h2 className="text-base font-serif font-bold text-ink flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-crimson stroke-[1.75]" />
                      <span>Blood Stock Summary</span>
                    </h2>
                    <p className="text-xs font-sans text-ink-soft mt-0.5">
                      Live inventory units across all 8 standard blood groups.
                    </p>
                  </div>
                  <Link
                    to="/hospital/blood-stock"
                    className="text-xs font-mono font-bold uppercase tracking-wider text-crimson hover:underline px-2.5 py-1 rounded-lg transition-colors"
                  >
                    Manage Stock &rarr;
                  </Link>
                </div>

                {/* 8 Blood Types Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {ALLOWED_BLOOD_TYPES.map((type) => {
                    const quantity = bloodStockMap[type] ?? 0;
                    const isLow = quantity < 5;

                    return (
                      <div
                        key={type}
                        className={`p-4 rounded-xl border transition-all ${isLow
                            ? 'bg-crimson/5 border-crimson/20 shadow-xs'
                            : 'bg-paper/60 border-line-soft hover:border-line'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-ink bg-white px-2.5 py-0.5 rounded border border-line-soft">
                            {type}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isLow ? 'bg-crimson/10 text-crimson' : 'bg-verified/10 text-verified'
                              }`}
                          >
                            {isLow ? 'Low Stock' : 'Adequate'}
                          </span>
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                          <span className="text-2xl font-serif font-bold text-ink tracking-tight">
                            {quantity}
                          </span>
                          <span className="text-xs font-mono text-ink-soft font-medium">units</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HospitalDashboardPage;