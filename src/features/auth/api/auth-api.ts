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
  try {
    const response = await axiosInstance.post('/api/auth/login', credentials);
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
 * Validates setup token and retrieves prefilled email context
 * GET /api/auth/admin/setup?token=xyz
 */
export const getInviteContext = async (token: string) => {
  try {
    const response = await axiosInstance.get('/api/auth/admin/setup', {
      params: { token },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Invalid or expired setup token.";
  }
};

export const setupAdminPassword = async (payload: any) => {
  try {
    const response = await axiosInstance.post('/api/auth/admin/setup', payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to set password. Link may be expired.";
  }
};


/**
 * Completes an invitation sent by Super Admin.
 * Endpoint: POST /api/auth/admin/setup
 */
export const acceptInvitation = async (payload: {
  setupToken?: string;
  token?: string;
  centerName?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  termsAccepted?: boolean;
  location?: { lat: number; lng: number; address: string };
}) => {
  try {
    const response = await axiosInstance.post('/api/auth/admin/setup', {
      setupToken: payload.setupToken || payload.token,
      token: payload.token || payload.setupToken,
      centerName: payload.centerName || payload.name,
      phone: payload.phone,
      password: payload.password,
      confirmPassword: payload.confirmPassword || payload.password,
      termsAccepted: payload.termsAccepted ?? true,
      location: payload.location,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to complete account setup. Link may be expired or invalid.";
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

/**
 * Fetches current authenticated user context and permissions
 * GET /api/auth/me
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to fetch user session.";
  }
};