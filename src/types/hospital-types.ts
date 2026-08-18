import type { LocationData } from '../registration/types/registration-types';
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

export interface BloodStockUpdateResponse {
  message?: string;
  success?: boolean;
  bloodStock?: BloodStock;
  [key: string]: unknown;
}

export interface BloodRequestPayload {
  bloodType: BloodType;
  quantity: number;
  notes?: string;
}

export interface BloodRequestResponse {
  id?: string;
  message?: string;
  success?: boolean;
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
