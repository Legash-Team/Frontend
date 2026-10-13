import type { LocationData } from '@/features/registration/types/registration-types';
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
  acceptedCount?: number;
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

// ─── Donation Records Queue (Backend Part 11) ────────────────────────────────

export interface PendingDonationRecord {
  id: string; // record ID or acceptance ID
  acceptanceId?: string;
  donorId?: string;
  donorName?: string;
  name?: string;
  shortId?: string;
  donorShortId?: string;
  donor?: {
    id?: string;
    name?: string;
    shortId?: string;
    bloodType?: BloodType | string;
    phone?: string;
    email?: string;
  };
  requestId?: string;
  request?: {
    id?: string;
    bloodType?: BloodType | string;
    requestType?: RequestType | string;
    isEmergency?: boolean;
    description?: string;
    createdAt?: string;
  };
  requestDescription?: string;
  requestBloodType?: BloodType | string;
  acceptedAt?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export type DonationRecordOutcome = 'donated' | 'did_not_donate';

export interface SubmitDonationRecordPayload {
  recordId?: string;
  acceptanceId?: string;
  donorId?: string;
  requestId?: string;
  outcome: DonationRecordOutcome;
  // Fields for outcome === 'donated'
  donorBloodType?: BloodType;
  donatedToBloodType?: BloodType;
  height?: string;
  weight?: string;
  healthStatus?: string;
  peopleSaved?: string | number;
  thankYouMessage?: string;
  [key: string]: unknown;
}

export interface SubmitDonationRecordResponse {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
}

