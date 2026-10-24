export interface HospitalLocation {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  mapsUrl?: string | null;
  coordinates?: number[] | { lat: number; lng: number } | null;
}

export type LocationData = HospitalLocation;

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

export const ADEQUATE_BLOOD_STOCK_THRESHOLD = 50;

export type BloodStock = Record<BloodType, number>;

export interface HospitalProfile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  location: HospitalLocation | null;
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
  donorId?: string;
  shortId?: string;
  responseId?: string;
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
  location: HospitalLocation | null;
  hasStock?: boolean;
  stockQuantity?: number;
  availableStock?: BloodStock;
  mapsUrl?: string | null;
  [key: string]: unknown;
}

// --- DONATION MEDICAL RECORDS ---
// Captured when a donor who accepted a blood request actually donates at the
// facility: units collected plus the screening/vitals record.

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

export type DonationOutcome = 'donated' | 'did_not_donate';

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

