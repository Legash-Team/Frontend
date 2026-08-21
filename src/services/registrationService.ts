import axiosInstance from '@/services/axiosInstance';
import type { RegisterPayload, RegisterResponse } from '@/types/registration-types';

export const registerHospital = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  try {
    const response = await axiosInstance.post<RegisterResponse>(
      '/api/hospitals/register',
      payload
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error('Network Error');
  }
};

export default registerHospital;
