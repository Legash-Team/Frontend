import axiosInstance from '@/api/axiosInstance';
import type { BloodType } from '@/features/hospital/types/hospital-types';

export interface BloodCenterRequestItem {
  id: string;
  bloodType: BloodType;
  quantityNeeded: number;
  note?: string;
  status: 'open' | 'closed';
  closedReason?: string;
  closesAt: string;
  closedAt?: string;
  createdAt: string;
  matchedCenterCount: number;
  acceptedCount: number;
  deniedCount: number;
  pendingCount: number;
}

export interface AcceptedBloodCenter {
  id: string;
  centerName: string;
  phone: string;
  email: string;
  address?: string;
  location?: any;
  coordinates?: { lat: number; lng: number } | null;
  mapsUrl?: string | null;
  respondedAt?: string;
}

export interface IncomingBloodCenterRequest {
  requestId: string;
  bloodType: BloodType;
  quantityNeeded: number;
  note: string;
  createdAt: string;
  closesAt: string;
  responseStatus: 'pending' | 'accepted' | 'denied';
  respondedAt?: string;
}

// Hospital API calls
export const createBloodCenterRequest = async (payload: {
  bloodType: string;
  quantityNeeded: number;
  closesAt: string;
  note?: string;
}) => {
  const response = await axiosInstance.post('/api/hospital/blood-center-requests', payload);
  return response.data;
};

export const fetchHospitalBloodCenterRequests = async (): Promise<BloodCenterRequestItem[]> => {
  const response = await axiosInstance.get<{ success: boolean; requests: BloodCenterRequestItem[] }>(
    '/api/hospital/blood-center-requests'
  );
  return response.data?.requests || [];
};

export const fetchAcceptedBloodCenters = async (requestId: string): Promise<AcceptedBloodCenter[]> => {
  const response = await axiosInstance.get<{ success: boolean; acceptedCenters: AcceptedBloodCenter[] }>(
    `/api/hospital/blood-center-requests/${requestId}/accepted-centers`
  );
  return response.data?.acceptedCenters || [];
};

export const closeBloodCenterRequest = async (requestId: string) => {
  const response = await axiosInstance.patch(`/api/hospital/blood-center-requests/${requestId}/close`, {
    reason: 'fulfilled_manually',
  });
  return response.data;
};

// Blood Center (Admin) API calls
export const fetchIncomingBloodCenterRequests = async (): Promise<IncomingBloodCenterRequest[]> => {
  const response = await axiosInstance.get<{ success: boolean; requests: IncomingBloodCenterRequest[] }>(
    '/api/admin/blood-center-requests'
  );
  return response.data?.requests || [];
};

export const respondToBloodCenterRequest = async (requestId: string, status: 'accepted' | 'denied') => {
  const response = await axiosInstance.patch(`/api/admin/blood-center-requests/${requestId}/respond`, {
    status,
  });
  return response.data;
};
