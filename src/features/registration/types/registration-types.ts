export interface LocationData {
  lat: number;
  lng: number;
}

// 1. Internal Form State (What the user types) - Keep this as is
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  licenseNumber: string;
  phone: string;
  address: string;
  location: LocationData | null;
  agreeToTerms: boolean;
}

// 2. API PAYLOAD (What the backend actually expects)
// I have modified this to match the official contract keys
export interface RegisterPayload {
  hospitalName: string;      // CHANGED: Backend wants 'hospitalName', not 'name'
  email: string;
  password: string;
  licenseNumber: string;
  phone: string;
  location: {                // CHANGED: Backend wants a flat object, NOT coordinates array
    lat: number;
    lng: number;
    address: string;
  };
  agreedToTerms: boolean;    // FIXED: Ensure spelling matches 'agreedToTerms'
}

export type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

export interface RegisterResponse {
  success: boolean;          // Changed to required as per contract
  message: string;           // Changed to required as per contract
  hospitalId?: string;       // Added specifically from the response schema
}