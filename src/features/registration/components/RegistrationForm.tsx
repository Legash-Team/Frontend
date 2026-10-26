import React from 'react';
import { Link } from 'react-router-dom';
import useRegisterForm from '../hooks/useRegisterForm';
import HospitalDetails from './HospitalDetails';
import PasswordFields from './PasswordFields';
import LocationField from './LocationField';
import TermsAgreement from './TermsAgreement';
import Button from '@/components/ui/Button';
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
