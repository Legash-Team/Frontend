import axiosInstance from '@/api/axiosInstance';

/**
 * GET /api/superadmin/hospitals/pending
 */
export const fetchPendingHospitals = async () => {
  try {
    const response = await axiosInstance.get<{ success: boolean; hospitals: any[] }>('/api/superadmin/hospitals/pending');
    return response.data; // Expected: { success: true, hospitals: [...] }
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to fetch pending list.";
  }
};

/**
 * POST /api/superadmin/hospitals/:id/approve
 */
export const approveHospital = async (id: string) => {
  try {
    const response = await axiosInstance.post<{ success: boolean; message?: string }>(`/api/superadmin/hospitals/${id}/approve`, {});
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to approve hospital.";
  }
};

/**
 * POST /api/superadmin/hospitals/:id/reject
 */
export const rejectHospital = async (id: string, reason: string) => {
  try {
    const response = await axiosInstance.post<{ success: boolean; message?: string }>(`/api/superadmin/hospitals/${id}/reject`, { reason });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to reject hospital.";
  }
};

/**
 * GET /api/superadmin/feedbacks
 */
export const fetchFeedbacks = async () => {
  try {
    const response = await axiosInstance.get<{ success: boolean; feedbacks: any[] }>('/api/superadmin/feedbacks');
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to fetch feedbacks.";
  }
};

/**
 * PATCH /api/superadmin/feedbacks/:id/reviewed
 */
export const markFeedbackReviewed = async (id: string) => {
  try {
    const response = await axiosInstance.patch<{ success: boolean; message?: string }>(`/api/superadmin/feedbacks/${id}/reviewed`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to mark feedback as reviewed.";
  }
};

/**
 * POST /api/media
 */
export const uploadMedia = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<{
      success: boolean;
      url: string;
      resourceType: string;
    }>('/api/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to upload media content.";
  }
};

/**
 * POST /api/superadmin/events
 */
export const createEvent = async (payload: {
  mediaUrl?: string;
  mediaType?: string;
  description: string;
  applyLink?: string;
  closesAt: string;
}) => {
  try {
    const response = await axiosInstance.post<{
      success: boolean;
      message?: string;
      event?: any;
    }>('/api/superadmin/events', payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || "Failed to create event.";
  }
};

/**
 * POST /api/superadmin/admins
 */
export const createAdmin = async (payload: {
  name: string;
  email: string;
  permissions: {
    canApproveHospitals: boolean;
    canPostEvents: boolean;
  };
}) => {
  try {
    const response = await axiosInstance.post<{
      success: boolean;
      message?: string;
      admin?: {
        id: string;
        name: string;
        email: string;
        permissions: { canApproveHospitals: boolean; canPostEvents: boolean };
        emailVerified: boolean;
        createdAt: string;
      };
    }>('/api/superadmin/admins', payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || 'Failed to create admin.';
  }
};

/**
 * GET /api/superadmin/admins
 */
export const listAdmins = async () => {
  try {
    const response = await axiosInstance.get<{
      success: boolean;
      admins: Array<{
        id: string;
        name: string;
        email: string;
        permissions: { canApproveHospitals: boolean; canPostEvents: boolean };
        emailVerified: boolean;
        createdAt: string;
      }>;
    }>('/api/superadmin/admins');
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || 'Failed to fetch admins.';
  }
};
/**
 * DELETE /api/superadmin/admins/:id
 */
export const deleteAdmin = async (id: string) => {
  try {
    const response = await axiosInstance.delete<{ success: boolean; message?: string }>(`/api/superadmin/admins/${id}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || 'Failed to delete admin.';
  }
};
