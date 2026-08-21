import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const registerHospital = async (payload: any) => {
  try {
    // Exact path from contract: /api/hospital/register
    const response = await axios.post(`${API_BASE_URL}/api/hospital/register`, payload);
    return response.data;
  } catch (error: any) {
    // The backend sends { success: false, error: "..." }
    // We throw the error string so the hook can display it
    throw error.response?.data?.error || "Registration failed. Please try again.";
  }
};