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
  location: {
    lat?: number | null;
    lng?: number | null;
    address?: string;
    mapsUrl?: string | null;
  } | LocationData | null;
  stockQuantity?: number;
  availableUnits?: number;
  availableStock?: BloodStock;
  mapsUrl?: string | null;
  hasStock?: boolean;
  [key: string]: unknown;
}

// --- DONATION MEDICAL RECORDS ---
// Captured when a donor who accepted a blood request actually donates at the
// facility: units collected plus the screening/vitals record, since every
// unit is tested in the lab before it can be transfused.

export type ScreeningResult = 'non_reactive' | 'reactive' | 'pending';

export interface DonationScreening {
  hiv: ScreeningResult;
  hepatitisB: ScreeningResult;
  hepatitisC: ScreeningResult;
  syphilis: ScreeningResult;
  malaria: ScreeningResult;
}

export interface DonationVitals {
  hemoglobin: number | null;
  pulse: number | null;
  systolic: number | null;
  diastolic: number | null;
  temperature: number | null;
}

export type DonationOutcome = 'donated' | 'did_not_donate' | 'cleared' | 'deferred' | 'rejected';

export interface DonationRecord {
  id: string;
  requestId?: string | null;
  responseId?: string | null;
  donorId?: string | null;
  donorName: string;
  donorPhone?: string;
  bloodType?: BloodType | null;
  unitsCollected: number;
  donatedOn: string;
  screening: DonationScreening;
  vitals: DonationVitals;
  outcome: DonationOutcome;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface DonationRecordPayload {
  requestId?: string | null;
  responseId?: string | null;
  donorId?: string | null;
  donorName: string;
  donorPhone?: string;
  bloodType?: BloodType | null;
  unitsCollected: number;
  donatedOn: string;
  screening: DonationScreening;
  vitals: DonationVitals;
  outcome: DonationOutcome;
  notes?: string;
  recordedBy: string;
}

// --- DONATION QUEUE (hospital dashboard pending-donation notifications) ---
// Paired with Backend's donation-history workflow. The dashboard indicator only
// uses the lightweight count endpoint; the full donor queue is fetched on demand
// when the hospital opens the notification modal.

export type DonationQueueOutcome = 'donated' | 'did_not_donate';

export interface PendingDonation {
  id: string;
  shortId: string;
  name: string;
  acceptedRequest: string; // reference of the request the donor accepted
  phone?: string;
  bloodType?: string;
  bloodRequestId?: string;
  bloodRequestResponseId?: string;
  responseId?: string;
  donorId?: string;
  acceptedAt?: string;
  request?: {
    id: string;
    bloodType: string;
    quantityNeeded?: number;
    isEmergency?: boolean;
    status?: string;
    description?: string;
    createdAt?: string;
  };
  donor?: {
    id: string;
    shortId?: string;
    name?: string;
    phone?: string;
    bloodType?: string;
  };
}

export interface DonationOutcomePayload {
  outcome: DonationQueueOutcome;
  // Only supplied when outcome === 'donated'
  donorBloodType?: BloodType;
  donatedToBloodType?: BloodType;
  heightCm?: number;
  weightKg?: number;
  healthStatus?: string;
  peopleSaved?: number;
  thankYouMessage?: string;
}

export interface PendingCountResponse {
  count: number;
}

