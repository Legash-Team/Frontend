import axiosInstance from '@/api/axiosInstance';
import type { HospitalStockResponse, HospitalStockItem } from '../models/hospital-stock-types';
import type { HospitalAnalyticsResponse } from '../models/hospital-analytics-types';

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
  title: string;
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
 * Sends an invitation link to the given email for Blood Center account setup.
 */
export const inviteAdmin = async (payload: {
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
    throw error.response?.data?.error || 'Failed to send invitation link.';
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

/**
 * GET /api/superadmin/hospitals/stock
 */
export const fetchHospitalStock = async (bloodType: string = '', sortOption: string = ''): Promise<HospitalStockResponse> => {
  try {
    const params = new URLSearchParams();
    if (bloodType) params.append('bloodType', bloodType);

    // Map UI sort options to valid backend parameters
    let sortBy = 'hospitalName';
    let order = 'asc';
    if (sortOption === 'units_desc') {
      sortBy = 'totalUnits';
      order = 'desc';
    } else if (sortOption === 'units_asc') {
      sortBy = 'totalUnits';
      order = 'asc';
    } else if (sortOption === 'name_desc') {
      sortBy = 'hospitalName';
      order = 'desc';
    } else if (sortOption === 'name_asc') {
      sortBy = 'hospitalName';
      order = 'asc';
    }
    params.append('sortBy', sortBy);
    params.append('order', order);
    params.append('limit', '100');
    params.append('page', '1');

    const response = await axiosInstance.get<{
      success: boolean;
      hospitals?: any[];
      data?: any[];
      pagination?: any;
    }>(`/api/superadmin/hospitals/stock?${params.toString()}`);

    const rawList = response.data.hospitals || response.data.data || [];
    const mappedItems: HospitalStockItem[] = rawList.map((h: any) => ({
      id: h.id || h._id,
      hospitalName: h.hospitalName,
      phone: h.phone,
      location: h.location,
      bloodType: bloodType || 'All Types',
      availableUnits: bloodType ? (h.stock?.[bloodType] ?? h.totalUnits ?? 0) : (h.totalUnits ?? 0),
    }));

    return {
      success: response.data.success ?? true,
      data: mappedItems,
    };
  } catch (error: any) {
    throw error.response?.data?.error || 'Failed to fetch hospital stock.';
  }
};

/**
 * GET /api/superadmin/analytics/hospitals
 */
export const fetchHospitalAnalytics = async (): Promise<HospitalAnalyticsResponse> => {
  try {
    const response = await axiosInstance.get(`/api/superadmin/analytics/hospitals`);
    const raw = response.data;
    if (raw?.data && raw.data.nationalTotals) {
      return { success: true, data: raw.data };
    }
    const analytics = raw?.analytics || {};
    return {
      success: raw?.success ?? true,
      data: {
        nationalTotals: analytics.national?.byBloodType || {},
        topHospitals: analytics.topHospitals || [],
        bottomHospitals: analytics.bottomHospitals || [],
        trends: (analytics.trends?.last30Days || []).map((t: any) => ({
          date: t.date,
          ...(t.byBloodType || {}),
        })),
      },
    };
  } catch (error: any) {
    throw error.response?.data?.error || 'Failed to fetch hospital analytics.';
  }
};
