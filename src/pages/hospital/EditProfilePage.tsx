import React, { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
} from 'lucide-react';

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        let message = t('editProfile.loadFailed');
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
      newErrors.name = t('auth.register.errors.nameRequired');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profile.email || !profile.email.trim()) {
      newErrors.email = t('auth.register.errors.emailRequired');
    } else if (!emailRegex.test(profile.email.trim())) {
      newErrors.email = t('auth.register.errors.emailInvalid');
    }

    const phoneTrimmed = profile.phone ? profile.phone.trim() : '';
    const ethiopianPhoneRegex = /^\+251[0-9]{9}$/;
    if (!phoneTrimmed) {
      newErrors.phone = t('auth.register.errors.phoneRequired');
    } else if (!phoneTrimmed.startsWith('+251')) {
      newErrors.phone = t('editProfile.phonePrefix');
    } else if (!ethiopianPhoneRegex.test(phoneTrimmed)) {
      newErrors.phone = t('editProfile.phoneInvalid');
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
            t('editProfile.verificationNotice')
        );
      } else {
        setSuccessMsg(response.message || t('editProfile.updateSuccess'));
      }

      if (response.hospital) {
        setProfile((prev) => ({
          ...prev,
          name: response.hospital?.name || prev.name,
          phone: response.hospital?.phone || prev.phone,
          email: response.hospital?.email || prev.email,
        }));
      }

      setTimeout(() => {
        navigate('/hospital/profile');
      }, 900);
    } catch (err: unknown) {
      let message = t('editProfile.updateFailed');
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
    <DashboardLayout
      icon={<Pencil size={16} className="stroke-[1.75]" />}
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <Link to="/hospital/profile" className="hover:text-red-600 transition-colors">
                {t('editProfile.breadcrumbProfile')}
              </Link>
              <span>/</span>
              <span className="text-gray-900">{t('editProfile.breadcrumbEdit')}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              <span>{t('editProfile.title')}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t('editProfile.description')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/hospital/profile')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('editProfile.cancelBack')}</span>
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
            <p className="mt-3 text-sm text-gray-600 font-medium">{t('editProfile.loading')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 text-white">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-500" />
                <span>{t('editProfile.formTitle')}</span>
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
                    <p className="font-semibold">{t('editProfile.verificationSent')}</p>
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
                  label={t('auth.register.hospitalName')}
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder={t('auth.register.namePlaceholder')}
                  requiredBadge
                  disabled={submitting}
                />

                {/* Editable Field: Phone */}
                <Input
                  label={t('editProfile.phoneLabel')}
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="+251911234567"
                  helperText={t('editProfile.phoneHelper')}
                  requiredBadge
                  disabled={submitting}
                />

                {/* Editable Field: Email */}
                <div className="md:col-span-2">
                  <Input
                    label={t('auth.login.emailLabel')}
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="contact@hospital.org"
                    helperText={t('editProfile.emailHelper')}
                    requiredBadge
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate('/hospital/profile')}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-xs transition-colors"
                >
                  {t('dialog.cancel')}
                </button>

                <Button
                  type="submit"
                  isLoading={submitting}
                  loadingText={t('editProfile.saving')}
                  className="px-6 gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{t('editProfile.save')}</span>
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
