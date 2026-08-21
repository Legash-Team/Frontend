import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const verifyHospitalOTP = async (email: string, code: string) => {
  try {
    // Exact path from contract: /api/hospital/verify-email
    const response = await axios.post(`${API_BASE_URL}/api/hospital/verify-email`, {
      email,
      code
    });
    return response.data;
  } catch (error: any) {
    // Passes the backend error message (e.g., "Invalid code") to the UI
    throw error.response?.data?.error || "Verification failed. Please try again.";
  }
};
// ... existing imports

/**
 * Resends the 6-digit OTP to the hospital's email.
 * Endpoint: POST /api/hospital/resend-email-code
 */
export const resendHospitalOTP = async (email: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/hospital/resend-email-code`, { 
      email 
    });
    return response.data;
  } catch (error: any) {
    // Handles the 429 Rate Limit error specifically
    throw error.response?.data?.error || "Failed to resend code.";
  }
};
export const loginUser = async (credentials: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
    // This returns the token, role, permissions, and user object
    return response.data; 
  } catch (error: any) {
    // Specifically passing back the error message for 401 or 422
    throw error.response?.data?.error || "Login failed.";
  }
};
/**
 * Requests a password reset OTP/link for Hospitals or Admins
 * POST /api/auth/forgot-password
 */
export const requestPasswordResetEmail = async (email: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { 
      email 
    });
    return response.data; // Returns { success: true, message: "..." }
  } catch (error: any) {
    // Throws the specific error from the backend (e.g., "User not found")
    throw error.response?.data?.error || "Failed to process request.";
  }
};
/**
 * Resets the password using the code received via email
 * POST /api/auth/reset-password
 */
export const resetPassword = async (payload: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, payload);
    return response.data; // { success: true, message: "..." }
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to reset password.";
  }
};
/**
 * Establishes the password for a newly invited Admin
 * POST /api/auth/admin/setup
 */
export const setupAdminPassword = async (payload: any) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/admin/setup`, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to set password. Link may be expired.";
  }
};