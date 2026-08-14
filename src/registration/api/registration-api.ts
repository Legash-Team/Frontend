import axiosInstance from '../../api/axiosInstance';
import type { RegisterPayload, RegisterResponse } from '../types/registration-types';

export const registerHospital = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>('/hospital/register', payload);
  return response.data;
};

export default registerHospital;
