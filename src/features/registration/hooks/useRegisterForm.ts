import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RegisterFormData, FormErrors, RegisterPayload } from '../types/registration-types';
import { registerHospital } from '../api/registration-api';

const INITIAL_FORM_DATA: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  licenseNumber: '',
  phone: '',
  location: null,
  agreeToTerms: false,
};

export const useRegisterForm = () => {
  const navigate = useNavigate();

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
      const err = 'Geolocation is not supported by your browser.';
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
        let errorMsg = 'Failed to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please allow browser location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Location request timed out. Please try again.';
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
      newErrors.name = 'Hospital name is required.';
    }

    // 2. Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

  // 3. Phone (Ethiopian format - exactly 9 digits after the +251 prefix)
const phoneTrimmed = formData.phone ? formData.phone.trim() : '';
const suffixRegex = /^[0-9]{9}$/; // Only allows exactly 9 digits

if (!phoneTrimmed) {
  newErrors.phone = 'Phone number is required.';
} else if (!suffixRegex.test(phoneTrimmed)) {
  // This message is much better for the user
  newErrors.phone = 'Enter the 9 digits after +251 (e.g. 911223344)';
}

    // 4. License / Registration Number
    if (!formData.licenseNumber || !formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License / Registration number is required.';
    }

    // 5. Password
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    } else if (!hasUppercase) {
      newErrors.password = 'Password must contain at least 1 uppercase letter.';
    } else if (!hasSpecial) {
      newErrors.password = 'Password must contain at least 1 special character.';
    }

    // 6. Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // 7. Location
    if (!formData.location) {
      newErrors.location = 'Hospital location is required. Please capture your location.';
    }

    // 8. Terms Agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Privacy Policy to register.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // NOTE: confirmPassword and agreeToTerms are strictly excluded from payload sent to backend
      const payload: RegisterPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        licenseNumber: formData.licenseNumber.trim(),
        phone: formData.phone.trim(),
        location: formData.location!,
      };

      const response = await registerHospital(payload);

      const successMsg =
        response?.message ||
        'Registration successful! Please check your email to verify your account.';

      setSubmitSuccess(successMsg);

      // Redirect to /login after 2.5 seconds (No auto-login per requirements)
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string; error?: string } } };
        const msg =
          axiosErr.response?.data?.message ||
          axiosErr.response?.data?.error ||
          'Registration failed. Please check your information and try again.';
        setSubmitError(msg);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('An unexpected error occurred during registration.');
      }
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
