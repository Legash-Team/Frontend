import axios from 'axios';
import { RegisterPayload } from '../types/registration-types';0

// 1. Define the response type locally to fix the 'Cannot find RegisterResponse' error
export interface RegisterResponse {
  success: boolean;
  message: string;
  hospitalId?: string;
}

// 2. Use the Base URL from your environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Sends the registration payload to the Render Mock API.
 * The payload is already formatted by the useRegisterForm hook.
 */
export const registerHospital = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  try {
    // We hit the exact path from your contract: /api/hospitals/register
    const response = await axios.post(`${API_BASE_URL}/api/hospitals/register`, payload);
    
    return response.data;
  } catch (error: any) {
    // 3. Proper Error Handling: 
    // Passes the 422 Validation Error or other backend errors to the hook
    throw error.response?.data || new Error('Connection to Legash API failed');
  }
};