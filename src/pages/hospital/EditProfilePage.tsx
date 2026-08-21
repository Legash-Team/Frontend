import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { getHospitalProfile, updateHospitalProfile } from '@/features/hospital/api/hospital-api';
import type { HospitalProfile, LocationData } from '@/features/hospital/types/hospital-types';
import {
  Pencil,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Mail,
  Building2,
  Save,
  MapPin,
  FileText,
} from 'lucide-react';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<HospitalProfile>({
    name: '',
    email: '',
    phone: '+251',
    licenseNumber: '',
    location: null,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await getHospitalProfile();
        if (isMounted && res) {
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
              '',
            email: (hospitalObj.email as string) || (raw.email as string) || '',
            phone: (hospitalObj.phone as string) || (raw.phone as string) || '+251',
            licenseNumber:
              (hospitalObj.licenseNumber as string) ||
              (hospitalObj.license_number as string) ||
              (raw.licenseNumber as string) ||
              '',
            location:
              (hospitalObj.location as LocationData | null) ||
              (raw.location as LocationData | null) ||
              null,
          });
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        let message = 'Failed to load hospital profile data for editing.';
        if (typeof err === 'object' && err !== null && 'response' in err) {
          const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
          message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
        } else if (err instanceof Error) {
          message = err.message;
        }
        setErrorMsg(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};

    if (!profile.name || !profile.name.trim()) {
      newErrors.name = 'Hospital name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.email || !profile.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(profile.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const phoneTrimmed = profile.phone ? profile.phone.trim() : '';
    const ethiopianPhoneRegex = /^\+251[0-9]{9}$/;
    if (!phoneTrimmed) {
      newErrors.phone = 'Phone number is required.';
    } else if (!phoneTrimmed.startsWith('+251')) {
      newErrors.phone = 'Phone number must start with +251';
    } else if (!ethiopianPhoneRegex.test(phoneTrimmed)) {
      newErrors.phone = 'Invalid Ethiopian phone format. Example: +251911234567';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setVerificationNotice(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await updateHospitalProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        email: profile.email.trim(),
      });

      if (response.verificationRequired) {
        setVerificationNotice(
          response.message ||
            'Email change requested! A verification link has been sent to your new email address. Please verify to complete the change.'
        );
      } else {
        setSuccessMsg(response.message || 'Hospital profile updated successfully!');
      }

      if (response.hospital) {
        setProfile((prev) => ({
          ...prev,
          name: response.hospital?.name || prev.name,
          phone: response.hospital?.phone || prev.phone,
          email: response.hospital?.email || prev.email,
        }));
      }
    } catch (err: unknown) {
      let message = 'Failed to update hospital profile.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        message = axiosErr.response?.data?.message || axiosErr.response?.data?.error || message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <Link to="/hospital/profile" className="hover:text-red-600 transition-colors">
                Profile
              </Link>
              <span>/</span>
              <span className="text-gray-900">Edit</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
              <Pencil className="w-6 h-6 text-red-600" />
              <span>Edit Hospital Profile</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update facility contact info. License number and geolocation pin are read-only.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/hospital/profile')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel & Back</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-3 text-sm text-gray-600 font-medium">Loading form data...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 text-white">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-500" />
                <span>Hospital Information Form</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Feedback Messages */}
              {successMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {verificationNotice && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm font-medium flex items-start gap-3">
                  <Mail className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Verification Request Sent</p>
                    <p className="text-xs mt-0.5">{verificationNotice}</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-medium flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Editable Field: Hospital Name */}
                <Input
                  label="Hospital Name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="e.g. St. Paul Hospital"
                  requiredBadge
                  disabled={submitting}
                />

                {/* Editable Field: Phone */}
                <Input
                  label="Phone Number (+251 format)"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+251911234567"
                  helperText="Ethiopian format (+251...)"
                  requiredBadge
                  disabled={submitting}
                />

                {/* Editable Field: Email */}
                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="contact@hospital.org"
                  helperText="Updating email triggers verification link"
                  requiredBadge
                  disabled={submitting}
                />

                {/* Read-Only Field: License Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      License / Reg. Number
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-semibold">
                      Read-Only
                    </span>
                  </label>
                  <input
                    type="text"
                    value={profile.licenseNumber}
                    disabled
                    className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 cursor-not-allowed font-mono"
                  />
                  <p className="text-xs text-gray-400">License number is fixed and cannot be changed.</p>
                </div>
              </div>

              {/* Read-Only Field: Geolocation Pin */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600" />
                    Hospital Coordinates
                  </span>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-semibold">
                    Read-Only
                  </span>
                </div>
                {profile.location ? (
                  <p className="text-xs text-gray-700 font-mono">
                    Latitude: {profile.location.lat} | Longitude: {profile.location.lng}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">No location coordinates registered.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/hospital/profile')}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>

                <Button
                  type="submit"
                  isLoading={submitting}
                  loadingText="Saving Profile..."
                  className="px-6 gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EditProfilePage;
