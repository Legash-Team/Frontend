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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <Building2 className="w-7 h-7 text-red-600" />
              <span>Hospital Profile</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Registered hospital credentials and verified emergency contact information.
            </p>
          </div>

          <Link
            to="/hospital/profile/edit"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-3 text-sm text-gray-600 font-medium">Fetching hospital profile...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-sm flex items-start justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <p className="font-semibold">Unable to fetch profile</p>
                <p className="text-red-700 text-xs mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchProfile}
              className="inline-flex items-center gap-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Profile Card View */}
        {!loading && !error && profile && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{profile.name}</h2>
                  <p className="text-xs text-gray-300 font-mono">
                    License #: {profile.licenseNumber}
                  </p>
                </div>
              </div>

              <Link
                to="/hospital/profile/edit"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold text-xs transition-colors border border-white/20"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Information</span>
              </Link>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hospital Name */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                  <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-red-600" />
                    Facility Name
                  </span>
                  <p className="text-base font-bold text-gray-900">{profile.name}</p>
                </div>

                {/* Email Address */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                  <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-red-600" />
                    Official Email (Login ID)
                  </span>
                  <p className="text-base font-bold text-gray-900">{profile.email}</p>
                </div>

                {/* Phone Number */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                  <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                    Emergency Phone Line
                  </span>
                  <p className="text-base font-bold text-gray-900">{profile.phone}</p>
                </div>

                {/* License Number */}
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                  <span className="text-xs font-semibold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    Ministry License / Registration Number
                  </span>
                  <p className="text-base font-bold font-mono text-gray-900">
                    {profile.licenseNumber}
                  </p>
                </div>
              </div>

              {/* Geolocation Pin Coordinates */}
              <div className="p-5 bg-red-50/40 border border-red-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-red-900 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Hospital Coordinates (Emergency Dispatch)
                  </span>
                  <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-semibold">
                    Read-Only
                  </span>
                </div>

                {profile.location ? (
                  <div className="text-xs text-gray-700">
                    <p className="font-semibold text-gray-900">
                      Latitude: <span className="font-mono text-red-700">{profile.location.lat}</span> |{' '}
                      Longitude: <span className="font-mono text-red-700">{profile.location.lng}</span>
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Coordinates are registered for automated nearest-hospital emergency dispatch.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No geographical coordinates registered.</p>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Link
                  to="/hospital/profile/edit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs"
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
