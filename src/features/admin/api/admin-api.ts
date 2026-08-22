import axiosInstance from '@/api/axiosInstance';

// 1. Get all hospitals waiting for approval
export const getPendingHospitals = async () => {
  const response = await axiosInstance.get('/api/superadmin/hospitals/pending');
  return response.data; // Expected: { success: true, hospitals: [...] }
};

// 2. Approve a hospital
export const approveHospital = async (id: string) => {
  const response = await axiosInstance.post(`/api/superadmin/hospitals/${id}/approve`);
  return response.data;
};

// 3. Reject a hospital with a reason
export const rejectHospital = async (id: string, reason: string) => {
  const response = await axiosInstance.post(`/api/superadmin/hospitals/${id}/reject`, { reason });
  return response.data;
};