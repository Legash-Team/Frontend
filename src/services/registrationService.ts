import axiosInstance from '@/services/axiosInstance';
import type { RegisterPayload, RegisterResponse } from '../types/registration-types';

export const registerHospital = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  // Format coordinates properly for Mock API (Sprint 1 schema: [lng, lat])
  const formattedPayload = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    licenseNumber: payload.licenseNumber,
    phone: payload.phone.startsWith('+251') ? payload.phone : `+251${payload.phone}`,
    location: {
      coordinates: [payload.location.lng, payload.location.lat],
      address: 'Addis Ababa, Ethiopia',
    },
  };

  const response = await axiosInstance.post<RegisterResponse>(
    '/api/hospitals/register',
    formattedPayload
  );

  // If hospitalId returned, auto-verify email on the mock API so hospital can log in immediately
  if (response.data?.hospitalId) {
    try {
      await axiosInstance.get(`/api/hospitals/verify-email/${response.data.hospitalId}`);
    } catch {
      // Verification notice
    }
  }

  return response.data;
};

export default registerHospital;
