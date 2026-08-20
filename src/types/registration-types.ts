export interface LocationData {
  lat: number;
  lng: number;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  licenseNumber: string;
  phone: string;
  location: LocationData | null;
  agreeToTerms: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  licenseNumber: string;
  phone: string;
  location: LocationData;
}

export type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

export interface RegisterResponse {
  message?: string;
  success?: boolean;
  [key: string]: unknown;
}
