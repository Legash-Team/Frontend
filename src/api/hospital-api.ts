import axiosInstance from './axiosInstance';
import type { RegisterPayload, RegisterResponse } from '@/features/registration/types/registration-types';
import type {
  DashboardData,
  HospitalProfile,
  ProfileUpdatePayload,
  ProfileUpdateResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  VerifyPasswordResponse,
  DeleteAccountResponse,
  BloodStock,
  BloodStockUpdateResponse,
  BloodRequestPayload,
  BloodRequestResponse,
  BloodRequest,
  HospitalSearchResult,
  BloodType,
  RequestType,
} from '../types/hospital-types';

/**
 * Fetch Hospital Dashboard Data (READ-ONLY)
 * GET /hospital/dashboard
 */
export const getHospitalDashboard = async (): Promise<DashboardData> => {
  const response = await axiosInstance.get<DashboardData>('/hospital/dashboard');
  return response.data;
};

/**
 * Fetch Hospital Profile Data
 * GET /hospital/profile
 */
export const getHospitalProfile = async (): Promise<HospitalProfile> => {
  const response = await axiosInstance.get<HospitalProfile>('/hospital/profile');
  return response.data;
};

/**
 * Update Hospital Profile (Editable: name, phone, email)
 * PUT /hospital/profile
 */
export const updateHospitalProfile = async (
  payload: ProfileUpdatePayload
): Promise<ProfileUpdateResponse> => {
  const response = await axiosInstance.put<ProfileUpdateResponse>('/hospital/profile', payload);
  return response.data;
};

/**
 * Change Hospital Password (when logged in)
 * PUT /hospital/change-password
 */
export const changeHospitalPassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  const response = await axiosInstance.put<ChangePasswordResponse>('/hospital/change-password', payload);
  return response.data;
};

/**
 * Request Password Reset Email (when current password is forgotten)
 * POST /hospital/password/forgot
 */
export const requestPasswordResetEmail = async (
  email: string
): Promise<{ message: string; success?: boolean }> => {
  const response = await axiosInstance.post<{ message: string; success?: boolean }>(
    '/hospital/password/forgot',
    { email }
  );
  return response.data;
};

/**
 * Delete Hospital Account Permanently
 * DELETE /hospital/profile
 */
export const deleteHospitalAccount = async (): Promise<DeleteAccountResponse> => {
  const response = await axiosInstance.delete<DeleteAccountResponse>('/hospital/profile');
  return response.data;
};

/**
 * Verify Hospital Password (for sensitive actions like modifying blood stock)
 * POST /hospital/verify-password
 */
export const verifyHospitalPassword = async (
  password: string
): Promise<VerifyPasswordResponse> => {
  const response = await axiosInstance.post<VerifyPasswordResponse>('/hospital/verify-password', {
    password,
  });
  return response.data;
};

/**
 * Fetch Hospital Blood Stock
 * GET /v1/inventory or /hospital/blood-stock
 */
export const getBloodStock = async (): Promise<BloodStock> => {
  const response = await axiosInstance.get<BloodStock>('/v1/inventory');
  return response.data;
};

/**
 * Update Hospital Blood Stock
 * PUT /v1/inventory or /hospital/blood-stock
 */
export const updateBloodStock = async (
  stock: BloodStock
): Promise<BloodStockUpdateResponse> => {
  const response = await axiosInstance.put<BloodStockUpdateResponse>('/v1/inventory', stock);
  return response.data;
};

/**
 * Fetch Blood Requests with optional type filter
 * GET /blood-requests or /hospital/blood-requests
 */
export const getBloodRequests = async (
  filter?: RequestType | 'All'
): Promise<BloodRequest[]> => {
  const params = filter && filter !== 'All' ? { type: filter } : undefined;
  const response = await axiosInstance.get<BloodRequest[] | { requests: BloodRequest[] } | { data: BloodRequest[] }>(
    '/blood-requests',
    { params }
  );

  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    if (Array.isArray((data as { requests?: BloodRequest[] }).requests)) {
      return (data as { requests: BloodRequest[] }).requests;
    }
    if (Array.isArray((data as { data?: BloodRequest[] }).data)) {
      return (data as { data: BloodRequest[] }).data;
    }
  }
  return [];
};

/**
 * Fetch a single Blood Request by ID
 * GET /blood-requests/:id
 */
export const getBloodRequestById = async (id: string): Promise<BloodRequest> => {
  const response = await axiosInstance.get<BloodRequest | { request: BloodRequest } | { data: BloodRequest }>(
    `/blood-requests/${id}`
  );
  const data = response.data;
  if (data && typeof data === 'object') {
    if ('request' in data && data.request) {
      return data.request as BloodRequest;
    }
    if ('data' in data && data.data) {
      return data.data as BloodRequest;
    }
  }
  return data as BloodRequest;
};

/**
 * Create a new Blood Request
 * POST /blood-requests
 */
export const createBloodRequest = async (
  payload: BloodRequestPayload
): Promise<BloodRequestResponse> => {
  const response = await axiosInstance.post<BloodRequestResponse>('/blood-requests', payload);
  return response.data;
};

/** 
 * Register a new Hospital
 * POST /hospitals/register
 */
export const registerHospital = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>('https://legash-mock.onrender.com/api/hospitals/register', payload);
  return response.data;
};

/**
 * Log in a Hospital
 * POST /hospital/login or /auth/login
 */
export const loginHospital = async (
  payload: { email: string; password: string }
): Promise<{ token?: string; auth_token?: string; message?: string; hospital?: HospitalProfile; success?: boolean }> => {
  const response = await axiosInstance.post<{
    token?: string;
    auth_token?: string;
    message?: string;
    hospital?: HospitalProfile;
    success?: boolean;
  }>('/hospital/login', payload);
  return response.data;
};
/**
 * Search Hospitals by Blood Type
 * GET /hospitals/search?bloodType=...
 */
export const searchHospitals = async (
  bloodType: BloodType,
  quantity: number = 1
): Promise<HospitalSearchResult[]> => {
  const response = await axiosInstance.get<HospitalSearchResult[]>('/hospitals/search', {
    params: { bloodType, quantity },
  });
  return response.data;
};
