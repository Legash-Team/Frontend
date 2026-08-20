import axios from 'axios';
import { RegisterPayload } from '../types/registration-types';

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
// Replace with your actual backend URL provided by the team
const API_BASE_URL = import.meta.env.VITE_API_URL;

export const registerHospital = async (payload: RegisterPayload) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/hospitals/register`, payload);
    return response.data;
  } catch (error: any) {
    // Throw the error response so the hook can catch it
    throw error.response?.data || new Error('Network Error');
  }
};
