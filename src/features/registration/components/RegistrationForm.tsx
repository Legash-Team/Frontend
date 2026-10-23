import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useRegisterForm from '../hooks/useRegisterForm';
import HospitalDetails from './HospitalDetails';
import PasswordFields from './PasswordFields';
import LocationField from './LocationField';
import TermsAgreement from './TermsAgreement';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const RegistrationForm: React.FC = () => {
  const {
    formData,
    errors,
    isSubmitting,
    submitError,
    submitSuccess,
    locationLoading,
    locationError,
    handleChange,
    handleGetLocation,
    handleSubmit,
  } = useRegisterForm();
  const { t } = useTranslation();

  // --- Google Sign-Up (moved here from the Login page) ---
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    if (!supabase) {
      setGoogleError(t('auth.register.googleNotConfigured'));
      setIsGoogleLoading(false);
      return;
    }
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        setGoogleError(error.message || t('auth.register.googleFailed'));
      }
    } catch (err: any) {
      setGoogleError(err?.message || t('auth.register.googleFailed'));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Success Notification Banner */}
      {submitSuccess && (
        <div className="p-3.5 bg-verified/10 border border-verified/20 rounded-xl text-verified text-xs font-medium flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">{t('auth.register.successTitle')}</p>
            <p className="mt-0.5">{submitSuccess}</p>
            <p className="mt-1 text-[11px] text-verified/80">
              {t('auth.register.redirecting')}
            </p>
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {submitError && (
        <div className="p-3.5 bg-crimson/10 border border-crimson/20 rounded-xl text-crimson text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">{t('auth.register.errorTitle')}</p>
            <p className="mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* Hospital General Details Section */}
      <HospitalDetails
        formData={formData}
        errors={errors}
        onChange={handleChange}
        disabled={isSubmitting || !!submitSuccess}
      />

      {/* Password Credentials Section */}
      <PasswordFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
        disabled={isSubmitting || !!submitSuccess}
      />

      {/* Browser Geolocation Section */}
      <LocationField
        location={formData.location}
        locationLoading={locationLoading}
        locationError={locationError}
        error={errors.location}
        onGetLocation={handleGetLocation}
        disabled={isSubmitting || !!submitSuccess}
      />

      {/* Terms & Privacy Policy Checkbox Section */}
      <TermsAgreement
        agreeToTerms={formData.agreeToTerms}
        error={errors.agreeToTerms}
        onChange={handleChange}
        disabled={isSubmitting || !!submitSuccess}
      />

      {/* Submit Action */}
      <div className="pt-2 space-y-4">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          loadingText={t('auth.register.submitting')}
          disabled={isSubmitting || !!submitSuccess}
          className="w-full h-14 bg-crimson hover:bg-crimson/90 text-white font-bold rounded-2xl shadow-lg text-base"
        >
          {t('auth.register.submitButton')}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line-soft"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-ink-soft/60 uppercase tracking-wider">{t('common.or')}</span>
          </div>
        </div>

        {/* Google Sign-Up (moved from the Login page) */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isSubmitting}
          className="w-full h-14 flex items-center justify-center gap-3 bg-white border border-line-soft rounded-2xl text-sm font-semibold text-ink hover:bg-paper hover:border-line transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <svg className="animate-spin h-5 w-5 text-ink-soft" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{isGoogleLoading ? t('auth.register.connectingToGoogle') : t('auth.register.continueWithGoogle')}</span>
        </button>

        {googleError && (
          <p className="text-xs text-crimson font-medium text-center mt-2">
            {googleError}
          </p>
        )}

        <div className="text-center text-sm text-ink-soft">
          {t('auth.register.alreadyRegistered')}{' '}
          <Link to="/login" className="text-crimson font-bold hover:underline">
            {t('auth.register.signIn')}
          </Link>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;
