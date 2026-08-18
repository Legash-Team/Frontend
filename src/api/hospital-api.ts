import axiosInstance from './axiosInstance';
import type { RegisterPayload, RegisterResponse } from '../registration/types/registration-types';
import type {
  DashboardData,
  HospitalProfile,
  ProfileUpdatePayload,
  ProfileUpdateResponse,
  BloodStock,
  BloodStockUpdateResponse,
  BloodRequestPayload,
  BloodRequestResponse,
  HospitalSearchResult,
  BloodType,
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
 * Fetch Hospital Blood Stock
 * GET /hospital/blood-stock
 */
export const getBloodStock = async (): Promise<BloodStock> => {
  const response = await axiosInstance.get<BloodStock>('/v1/inventory');
  return response.data;
};

/**
 * Update Hospital Blood Stock
 * PUT /hospital/blood-stock
 */
export const updateBloodStock = async (
  stock: BloodStock
): Promise<BloodStockUpdateResponse> => {
  const response = await axiosInstance.put<BloodStockUpdateResponse>('/v1/inventory', stock);
  return response.data;
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
 * POST /hospitals/register -> https://legash-mock.onrender.com/api/hospitals/register
 */
export const registerHospital = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const response = await axiosInstance.post<RegisterResponse>('https://legash-mock.onrender.com/api/hospitals/register', payload);
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

