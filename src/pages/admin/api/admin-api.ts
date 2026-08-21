import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Helper to get the token
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('legash_token')}` }
});

/**
 * GET /api/superadmin/hospitals/pending
 */
export const fetchPendingHospitals = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/superadmin/hospitals/pending`, getAuthHeader());
    return response.data; // Expected: { success: true, hospitals: [...] }
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to fetch pending list.";
  }
};

/**
 * POST /api/superadmin/hospitals/:id/approve
 */
export const approveHospital = async (id: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/superadmin/hospitals/${id}/approve`, {}, getAuthHeader());
  return response.data;
};

/**
 * POST /api/superadmin/hospitals/:id/reject
 */
export const rejectHospital = async (id: string, reason: string) => {
  const response = await axios.post(`${API_BASE_URL}/api/superadmin/hospitals/${id}/reject`, { reason }, getAuthHeader());
  return response.data;
};