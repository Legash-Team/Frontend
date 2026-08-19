import axios from 'axios';
import { RegisterPayload } from '../types/registration-types';

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
