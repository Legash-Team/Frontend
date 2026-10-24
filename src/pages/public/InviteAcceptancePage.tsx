import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/layouts/AuthLayout';
import Button from '@/components/ui/Button';
import { acceptInvitation } from '@/features/auth/api/auth-api';
import type { LocationData } from '@/features/registration/types/registration-types';
import {
  User,
  Lock,
  Phone,
  Eye,
  EyeOff,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

const InviteAcceptancePage: React.FC = () => {
  const navigate = useNavigate();
  const { token: pathToken } = useParams();
  const [searchParams] = useSearchParams();
  const inviteToken = pathToken || searchParams.get('token') || '';

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { t } = useTranslation();

  // --- LOCATION (same pattern as the register page) ---
  const handleGetLocation = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(t('auth.invite.errors.locationRequired'));
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
        setLocationLoading(false);
        setLocationError(null);
      },
      (error) => {
        setLocationLoading(false);
        let errorMsg = t('auth.invite.errors.locationRequired');
        if (error.code === error.PERMISSION_DENIED || error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
          errorMsg = t('auth.invite.errors.locationRequired');
        }
        setLocationError(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // --- VALIDATION (mirrors backend adminSetup rules) ---
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Center/admin name must be at least 2 characters.';
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (!password) {
      errors.password = t('auth.invite.errors.passwordRequired');
    } else if (password.length < 8) {
      errors.password = t('auth.invite.errors.passwordLength');
    } else if (!hasUppercase) {
      errors.password = t('auth.invite.errors.passwordUpper');
    } else if (!hasSpecial) {
      errors.password = t('auth.invite.errors.passwordSpecial');
    }

    if (!confirmPassword) {
      errors.confirmPassword = t('auth.invite.errors.confirmRequired');
    } else if (confirmPassword !== password) {
      errors.confirmPassword = t('auth.invite.errors.passwordMismatch');
    }

    // Ethiopian format: exactly 9 digits after the +251 prefix
    const phoneTrimmed = phone.trim();
    if (!phoneTrimmed) {
      errors.phone = t('auth.invite.errors.phoneRequired');
    } else if (!/^[0-9]{9}$/.test(phoneTrimmed)) {
      errors.phone = t('auth.invite.errors.phoneInvalid');
    }

    if (!location) {
      errors.location = t('auth.invite.errors.locationRequired');
    }

    if (!address.trim() || address.trim().length < 3) {
      errors.address = 'Physical address must be between 3 and 200 characters.';
    }

    if (!termsAccepted) {
      errors.termsAccepted = 'You must agree to the Terms of Service and Privacy Policy.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- SUBMIT: account setup → straight to login (no verification step) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!inviteToken) {
      setSubmitError(t('auth.invite.tokenMissing'));
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await acceptInvitation({
        setupToken: inviteToken,
        token: inviteToken,
        centerName: name.trim(),
        name: name.trim(),
        password,
        confirmPassword,
        phone: `+251${phone.trim()}`,
        termsAccepted: true,
        location: {
          lat: location!.lat,
          lng: location!.lng,
          address: address.trim(),
        },
      });

      if (res.success !== false) {
        // No verification step — go straight to the login page
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      setSubmitError(typeof err === 'string' ? err : err?.message || t('auth.invite.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full h-12 px-4 bg-white border rounded-xl outline-none transition-all text-sm font-medium ${
      hasError ? 'border-crimson focus:border-crimson' : 'border-line-soft focus:border-crimson focus:ring-1 focus:ring-crimson/10'
    }`;

  if (!inviteToken) {
    return (
      <AuthLayout
        title={t('auth.invite.invalidTitle')}
        subtitle={t('auth.invite.invalidSubtitle')}
      >
        <div className="text-center p-6 bg-crimson/5 rounded-2xl border border-crimson/20">
          <ShieldCheck className="w-12 h-12 text-crimson mx-auto mb-4 opacity-50" />
          <p className="text-ink font-bold">{t('auth.invite.invalidTitle')}</p>
          <p className="text-ink-soft text-sm">{t('auth.invite.askResend')}</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('auth.invite.title')}
      subtitle={t('auth.invite.subtitle')}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Error Banner */}
        {submitError && (
          <div className="p-3.5 bg-crimson/10 border border-crimson/20 rounded-xl text-crimson text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <p className="font-bold">{t('auth.invite.setupError')}</p>
              <p className="mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
            {t('auth.invite.fullName')} <span className="text-crimson">*</span>
          </label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40 group-focus-within:text-crimson transition-colors" size={18} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('auth.invite.namePlaceholder')}
              className={`${inputClass(!!fieldErrors.name)} pl-12`}
            />
          </div>
          {fieldErrors.name && (
            <p className="text-[10px] text-crimson font-bold uppercase">{fieldErrors.name}</p>
          )}
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
              {t('auth.invite.password')} <span className="text-crimson">*</span>
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40 group-focus-within:text-crimson transition-colors" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass(!!fieldErrors.password)} pl-12 pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[10px] text-crimson font-bold uppercase">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
              {t('auth.invite.confirmPassword')} <span className="text-crimson">*</span>
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40 group-focus-within:text-crimson transition-colors" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`${inputClass(!!fieldErrors.confirmPassword)} pl-12 pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-soft/40 hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-[10px] text-crimson font-bold uppercase">{fieldErrors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
            {t('auth.invite.phone')} <span className="text-crimson">*</span>
          </label>
          <div className="relative group">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft/40 group-focus-within:text-crimson transition-colors" size={18} />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="911223344"
              className={`${inputClass(!!fieldErrors.phone)} pl-24`}
            />
            <span className="absolute left-11 top-1/2 -translate-y-1/2 text-ink-soft/50 text-sm font-mono font-bold border-r border-line-soft pr-2">
              +251
            </span>
          </div>
          {fieldErrors.phone && (
            <p className="text-[10px] text-crimson font-bold uppercase">{fieldErrors.phone}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
            {t('auth.invite.location')} <span className="text-crimson">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              type="button"
              variant={location ? 'ghost' : 'outline'}
              onClick={handleGetLocation}
              isLoading={locationLoading}
              loadingText={t('auth.invite.accessingGps')}
              disabled={isSubmitting}
              className={`w-full h-12 text-xs font-bold rounded-xl border-line-soft transition-all ${
                location ? 'bg-verified/5 text-verified border-verified/20' : 'bg-paper text-ink hover:bg-sand/20'
              }`}
            >
              {location ? (
                <span className="flex items-center gap-2">
                  <Navigation size={14} /> {t('auth.invite.updateLocation')}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MapPin size={14} className="text-crimson" /> {t('auth.invite.currentLocation')}
                </span>
              )}
            </Button>

            <div
              className={`h-12 flex items-center px-4 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-tight transition-all ${
                location
                  ? 'bg-verified/5 border-verified/20 text-verified'
                  : 'bg-paper border-line-soft text-ink-soft/40'
              }`}
            >
              {location ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={14} /> {t('auth.invite.locationFound')}
                </span>
              ) : (
                t('auth.invite.waitingToLocate')
              )}
            </div>
          </div>
          {(locationError || fieldErrors.location) && (
            <p className="text-[10px] text-crimson font-bold uppercase">{locationError || fieldErrors.location}</p>
          )}
          <p className="text-[10px] text-ink-soft/50 italic leading-relaxed">
            {t('auth.invite.locationHint')}
          </p>
        </div>

        {/* Physical Address */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono font-bold text-ink-soft uppercase tracking-wider">
            Facility / Physical Address <span className="text-crimson">*</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Churchill Ave, Sub-city, Addis Ababa"
            className={inputClass(!!fieldErrors.address)}
          />
          {fieldErrors.address && (
            <p className="text-[10px] text-crimson font-bold uppercase">{fieldErrors.address}</p>
          )}
        </div>

        {/* Terms of Service */}
        <div className="space-y-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-line-soft text-crimson focus:ring-crimson"
            />
            <span className="text-xs text-ink leading-relaxed">
              I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong> for blood center operations on the Legash Network.
            </span>
          </label>
          {fieldErrors.termsAccepted && (
            <p className="text-[10px] text-crimson font-bold uppercase">{fieldErrors.termsAccepted}</p>
          )}
        </div>

        {/* Submit — no verification afterwards, straight to login */}
        <div className="pt-2 space-y-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            loadingText={t('auth.invite.submitting')}
            disabled={isSubmitting}
            className="w-full h-14 bg-crimson hover:bg-crimson/90 text-white font-bold rounded-2xl shadow-lg text-base"
          >
            {t('auth.invite.submitButton')}
          </Button>

          <p className="text-center text-xs text-ink-soft/70">
            {t('auth.invite.note')}
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default InviteAcceptancePage;
