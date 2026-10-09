import axiosInstance from '@/api/axiosInstance';

export const verifyHospitalOTP = async (email: string, code: string) => {
  try {
    // Exact path from contract: /api/hospital/verify-email
    const response = await axiosInstance.post('/api/hospital/verify-email', {
      email,
      code
    });
    return response.data;
  } catch (error: any) {
    // Passes the backend error message (e.g., "Invalid code") to the UI
    throw error.response?.data?.error || "Verification failed. Please try again.";
  }
};

/**
 * Resends the 6-digit OTP to the hospital's email.
 * Endpoint: POST /api/hospital/resend-email-code
 */
export const resendHospitalOTP = async (email: string) => {
  try {
    const response = await axiosInstance.post('/api/hospital/resend-email-code', { 
      email 
    });
    return response.data;
  } catch (error: any) {
    // Handles the 429 Rate Limit error specifically
    throw error.response?.data?.error || "Failed to resend code.";
  }
};

export const loginUser = async (credentials: any) => {
  // try {
  //   const response = await axiosInstance.post('/api/auth/login', credentials);
  //   return response.data; 
  // } catch (error: any) {
  //   throw error.response?.data?.error || "Login failed.";
  // }
  
  // --- TEMPORARY MOCK FOR SUPER ADMIN TESTING ---
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        token: "mock_superadmin_token_123",
        role: credentials.email.includes("admin") ? "admin" : "superadmin",
        permissions: {
          canApproveHospitals: true,
          canPostEvents: true,
        },
        user: {
          id: "superadmin_id",
          name: "Mock Super Admin",
          email: credentials.email,
        }
      });
    }, 1000);
  });
};

/**
 * Requests a password reset OTP/link for Hospitals or Admins
 * POST /api/auth/forgot-password
 */
export const requestPasswordResetEmail = async (email: string) => {
  try {
    const response = await axiosInstance.post('/api/auth/forgot-password', { 
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
    const response = await axiosInstance.post('/api/auth/reset-password', payload);
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
    const response = await axiosInstance.post('/api/auth/admin/setup', payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to set password. Link may be expired.";
  }
};

/**
 * Submit feedback/appeal for rejected hospital
 * POST /api/hospital/feedback
 */
export const submitHospitalFeedback = async (payload: { email: string; hospitalName?: string; message: string }) => {
  try {
    const response = await axiosInstance.post('/api/hospital/feedback', payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to submit appeal. Please try again.";
  }
};