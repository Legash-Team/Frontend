import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RegisterFormData, FormErrors } from '../types/registration-types';
import { registerHospital } from '../api/registration-api';

const INITIAL_FORM_DATA: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  licenseNumber: '',
  phone: '',
  location: null,
  address: '',
  agreeToTerms: false,
};

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Field change handler
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear specific field error when user types
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Browser Geolocation prompt handler
  const handleGetLocation = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      const err = t('auth.register.errors.geoUnsupported');
      setLocationError(err);
      setErrors((prev) => ({ ...prev, location: err }));
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        };

        setFormData((prev) => ({ ...prev, location: coords }));
        setLocationLoading(false);
        setLocationError(null);

        // Clear location field error
        setErrors((prev) => ({ ...prev, location: undefined }));
      },
      (error) => {
        setLocationLoading(false);
        let errorMsg = t('auth.register.errors.geoFailed');
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = t('auth.register.errors.geoDenied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = t('auth.register.errors.geoUnavailable');
        } else if (error.code === error.TIMEOUT) {
          errorMsg = t('auth.register.errors.geoTimeout');
        }
        setLocationError(errorMsg);
        setErrors((prev) => ({ ...prev, location: errorMsg }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Hospital Name
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = t('auth.register.errors.nameRequired');
    }

    // 2. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = t('auth.register.errors.emailRequired');
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = t('auth.register.errors.emailInvalid');
    }

  // 3. Phone (Ethiopian format - exactly 9 digits after the +251 prefix)
const phoneTrimmed = formData.phone ? formData.phone.trim() : '';
const suffixRegex = /^[0-9]{9}$/; // Only allows exactly 9 digits

if (!phoneTrimmed) {
  newErrors.phone = t('auth.register.errors.phoneRequired');
} else if (!suffixRegex.test(phoneTrimmed)) {
  // This message is much better for the user
  newErrors.phone = t('auth.register.errors.phoneInvalid');
}

    // 4. License / Registration Number
    if (!formData.licenseNumber || !formData.licenseNumber.trim()) {
      newErrors.licenseNumber = t('auth.register.errors.licenseRequired');
    }

    // 5. Password
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
    if (!formData.password) {
      newErrors.password = t('auth.register.errors.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.register.errors.passwordLength');
    } else if (!hasUppercase) {
      newErrors.password = t('auth.register.errors.passwordUpper');
    } else if (!hasSpecial) {
      newErrors.password = t('auth.register.errors.passwordSpecial');
    }

    // 6. Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.register.errors.confirmRequired');
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = t('auth.register.errors.passwordMismatch');
    }

    // 7. Location
    if (!formData.location) {
      newErrors.location = t('auth.register.errors.locationRequired');
    }

    // 8. Terms Agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = t('auth.register.errors.termsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setSubmitError(null);
  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    // BRIDGE: Mapping your UI state to the official JSON contract
    const payload = {
      hospitalName: formData.name.trim(),      // UI 'name' -> API 'hospitalName'
      email: formData.email.trim(),
      password: formData.password,
      licenseNumber: formData.licenseNumber.trim(),
      phone: `+251${formData.phone.trim()}`,   // Ensures +251 prefix
      location: {
        lat: formData.location!.lat,           // API wants flat lat/lng
        lng: formData.location!.lng,
        address: formData.address.trim()       // Takes text address from form
      },
      agreedToTerms: formData.agreeToTerms      // UI 'agreeToTerms' -> API 'agreedToTerms'
    };

    const response = await registerHospital(payload);

    if (response.success) {
      setSubmitSuccess(response.message);
      const cleanEmail = formData.email.trim();
      sessionStorage.setItem('pending_verification_email', cleanEmail);
      localStorage.setItem('pending_verification_email', cleanEmail);
      navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`, { state: { email: cleanEmail } });
    }
  } catch (err: any) {
    // This catches the 'error' string from our API service catch block
    setSubmitError(err);
  } finally {
    setIsSubmitting(false);
  }
};
  return {
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
  };
};

export default useRegisterForm;
