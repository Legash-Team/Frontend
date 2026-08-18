import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { getHospitalProfile } from '../api/hospital-api';
import type { HospitalProfile, LocationData } from '../types/hospital-types';
import {
  Building2,
  Mail,
  Phone,
  FileText,
  MapPin,
  Pencil,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const HospitalProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHospitalProfile();
      if (res) {
        const raw = (res as unknown as Record<string, unknown>) || {};
        const hospitalObj =
          (raw.hospital as Record<string, unknown>) ||
          (raw.data as Record<string, unknown>) ||
          raw;

        setProfile({
          id: (hospitalObj.id as string) || (raw.id as string) || undefined,
          name:
            (hospitalObj.name as string) ||
            (hospitalObj.hospitalName as string) ||
            (raw.name as string) ||
            'N/A',
          email: (hospitalObj.email as string) || (raw.email as string) || 'N/A',
          phone: (hospitalObj.phone as string) || (raw.phone as string) || 'N/A',
          licenseNumber:
            (hospitalObj.licenseNumber as string) ||
            (hospitalObj.license_number as string) ||
            (raw.licenseNumber as string) ||
            'N/A',
          location:
            (hospitalObj.location as LocationData | null) ||
            (raw.location as LocationData | null) ||
            null,
        });
      }
    } catch (err: unknown) {
      let message = 'Failed to load hospital profile data.';
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
    fetchProfile();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-line-soft">
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink tracking-tight flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-crimson stroke-[1.75]" />
              <span>Hospital Profile</span>
            </h1>
            <p className="text-sm font-sans text-ink-soft mt-1">
              Registered hospital credentials and verified emergency contact information.
            </p>
          </div>

          <Link
            to="/hospital/profile/edit"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-line-soft shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-crimson border-t-transparent"></div>
            <p className="mt-3 text-sm font-sans text-ink-soft font-medium">Fetching hospital profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-crimson/5 border border-crimson/20 rounded-xl p-4 text-ink text-sm flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-crimson shrink-0 stroke-[1.75]" />
              <div>
                <p className="font-serif font-bold text-ink">Unable to fetch profile</p>
                <p className="text-crimson text-xs mt-0.5 font-sans">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchProfile}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider bg-crimson/10 hover:bg-crimson/20 text-crimson px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Profile Card View */}
        {!loading && !error && profile && (
          <div className="bg-white rounded-2xl border border-line-soft shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-crimson to-crimson-dark px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl shadow-md border border-white/20">
                  <Building2 className="w-6 h-6 stroke-[1.75]" />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold tracking-tight">{profile.name}</h2>
                  <p className="text-xs text-red-100 font-mono">
                    License #: {profile.licenseNumber}
                  </p>
                </div>
              </div>

              <Link
                to="/hospital/profile/edit"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-white text-crimson hover:bg-paper rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Information</span>
              </Link>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hospital Name */}
                <div className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-crimson stroke-[1.75]" />
                    Facility Name
                  </span>
                  <p className="text-base font-serif font-bold text-ink">{profile.name}</p>
                </div>

                {/* Email Address */}
                <div className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-crimson stroke-[1.75]" />
                    Official Email (Login ID)
                  </span>
                  <p className="text-base font-sans font-medium text-ink">{profile.email}</p>
                </div>

                {/* Phone Number */}
                <div className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-crimson stroke-[1.75]" />
                    Emergency Phone Line
                  </span>
                  <p className="text-base font-sans font-medium text-ink">{profile.phone}</p>
                </div>

                {/* License Number */}
                <div className="p-4 bg-paper/60 border border-line-soft rounded-xl space-y-1">
                  <span className="text-[11px] font-mono font-bold uppercase text-ink-soft/70 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-crimson stroke-[1.75]" />
                    Ministry License / Registration Number
                  </span>
                  <p className="text-base font-mono font-semibold text-ink">
                    {profile.licenseNumber}
                  </p>
                </div>
              </div>

              {/* Geolocation Pin Coordinates */}
              <div className="p-5 bg-crimson/5 border border-crimson/15 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-ink tracking-tight flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-crimson stroke-[1.75]" />
                    Hospital Coordinates (Emergency Dispatch)
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-crimson/10 text-crimson px-2 py-0.5 rounded">
                    Read-Only
                  </span>
                </div>

                {profile.location ? (
                  <div className="text-xs font-sans text-ink-soft">
                    <p className="font-semibold text-ink">
                      Latitude: <span className="font-mono text-crimson font-bold">{profile.location.lat}</span> |{' '}
                      Longitude: <span className="font-mono text-crimson font-bold">{profile.location.lng}</span>
                    </p>
                    <p className="text-[11px] font-sans text-ink-soft/70 mt-1">
                      Coordinates are registered for automated nearest-hospital emergency dispatch.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs font-sans text-ink-soft/70">No geographical coordinates registered.</p>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-line-soft">
                <Link
                  to="/hospital/profile/edit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-crimson hover:bg-crimson-dark text-white rounded-xl font-sans font-semibold text-xs transition-colors shadow-xs"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit Profile Information</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HospitalProfilePage;
