import React from 'react';
import { Link } from 'react-router-dom';
import useRegisterForm from '../hooks/useRegisterForm';
import HospitalDetails from './HospitalDetails';
import PasswordFields from './PasswordFields';
import LocationField from './LocationField';
import TermsAgreement from './TermsAgreement';
import Button from '../../components/ui/Button';

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

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Success Notification Banner */}
      {submitSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm font-medium flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div className="flex-1">
            <p className="font-semibold text-emerald-950">Registration Successful!</p>
            <p className="mt-0.5">{submitSuccess}</p>
            <p className="mt-2 text-xs text-emerald-800 font-normal">
              Redirecting to login page...
            </p>
          </div>
        </div>
      )}

      {/* Error Notification Banner */}
      {submitError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-sm font-medium flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="font-semibold text-red-950">Registration Error</p>
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
          loadingText="Registering Hospital..."
          disabled={isSubmitting || !!submitSuccess}
          className="w-full py-3 text-base font-semibold shadow-md"
        >
          Register Hospital Account
        </Button>

        <div className="text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
            Sign in to Hospital Portal
          </Link>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;
