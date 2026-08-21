import type { LocationData } from '@/types/registration-types';
export type { LocationData };

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const ALLOWED_BLOOD_TYPES: readonly BloodType[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
] as const;

export type BloodStock = Record<BloodType, number>;

export interface HospitalProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  location: LocationData | null;
}

export interface DashboardData {
  hospital: HospitalProfile;
  bloodStock: BloodStock;
}

export interface ProfileUpdatePayload {
  name: string;
  phone: string;
  email: string;
}

export interface ProfileUpdateResponse {
  message?: string;
  success?: boolean;
  verificationRequired?: boolean;
  hospital?: HospitalProfile;
  [key: string]: unknown;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ChangePasswordResponse {
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}

export interface VerifyPasswordPayload {
  password: string;
}

export interface VerifyPasswordResponse {
  message?: string;
  success?: boolean;
  verified?: boolean;
  [key: string]: unknown;
}

export interface DeleteAccountResponse {
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}

export interface BloodStockUpdateResponse {
  message?: string;
  success?: boolean;
  bloodStock?: BloodStock;
  [key: string]: unknown;
}

export type RequestType = 'Emergency' | 'Normal';

export type BloodRequestStatus = 'ACTIVE' | 'PENDING' | 'ACCEPTED' | 'FULFILLED' | 'CLOSED' | 'CANCELLED';

export interface AcceptedDonor {
  id?: string;
  name: string;
  bloodType?: BloodType;
  phone?: string;
  email?: string;
  acceptedAt?: string;
  location?: LocationData | null;
  [key: string]: unknown;
}

export interface BloodRequest {
  id: string;
  hospitalId?: string;
  hospitalName?: string;
  bloodType: BloodType;
  quantity: number;
  requestType: RequestType;
  description?: string;
  closingDateTime: string;
  createdAt: string;
  status: BloodRequestStatus;
  acceptedDonors?: AcceptedDonor[];
  [key: string]: unknown;
}

export interface BloodRequestPayload {
  bloodType: BloodType;
  quantity: number;
  requestType: RequestType;
  closingDateTime: string;
  description?: string;
  notes?: string;
}

export interface BloodRequestResponse {
  id?: string;
  message?: string;
  success?: boolean;
  request?: BloodRequest;
  [key: string]: unknown;
}

export interface HospitalSearchResult {
  id?: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  location: LocationData | null;
  stockQuantity?: number;
  availableStock?: BloodStock;
  [key: string]: unknown;
}

