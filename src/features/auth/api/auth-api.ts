import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// 1. Verify Hospital Email (OTP)
export const verifyHospitalOTP = async (email: string, code: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/hospital/verify-email`, { email, code });
  return response.data;
};

// 2. Shared Login
export const loginUser = async (credentials: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    return response.data;
  } catch (error: any) {
    // Return the specific error object from the contract
    throw error.response?.data || { success: false, error: "Login failed" };
  }
};