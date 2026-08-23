import axiosInstance from '@/api/axiosInstance';
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
  AcceptedDonor,
} from '@/features/hospital/types/hospital-types';

// ─── Shared response types ────────────────────────────────────────────────────

export interface LoginResponse {
  success?: boolean;
  token?: string;
  auth_token?: string;
  role?: string;
  message?: string;
  verificationStatus?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  hospital?: HospitalProfile;
}

/**
 * Normalise the sanitized hospital shape returned by the backend
 * (sanitizeHospital helper) into our frontend HospitalProfile type.
 */
function mapSanitizedHospital(p: {
  id?: string;
  hospitalName?: string;
  name?: string;
  email: string;
  phone: string;
  licenseNumber: string;
  location?: { lat?: number | null; lng?: number | null; address?: string } | null;
}): HospitalProfile {
  return {
    id: p.id ? String(p.id) : undefined,
    name: p.hospitalName || p.name || '',
    email: p.email,
    phone: p.phone,
    licenseNumber: p.licenseNumber,
    location: p.location
      ? {
          lat: p.location.lat ?? 9.0108,
          lng: p.location.lng ?? 38.7613,
        }
      : null,
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Log in a Hospital / Admin / SuperAdmin
 * POST /api/auth/login
 */
export const loginHospital = async (
  payload: { email: string; password: string }
): Promise<LoginResponse> => {
  try {
    const response = await axiosInstance.post<{
      success: boolean;
      token?: string;
      role?: string;
      user?: { id: string; name: string; email: string };
      error?: string;
      message?: string;
    }>('/api/auth/login', payload);

    if (response.data?.success && response.data.token) {
      return {
        success: true,
        token: response.data.token,
        role: response.data.role || 'hospital',
        user: response.data.user,
        message: response.data.message || 'Login successful',
      };
    }

    // The backend returned 200 but no token — surface the error message
    throw new Error(response.data?.error || 'Login failed: no token returned.');
  } catch (err: any) {
    // Re-throw with the backend error string so the UI can display it
    const backendError =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'Login failed. Please check your credentials.';
    throw new Error(backendError);
  }
};

// ─── Blood Stock ──────────────────────────────────────────────────────────────

/**
 * Fetch Hospital Blood Stock
 * GET /api/hospital/blood-stock
 *
 * Backend returns: { success, stock: Record<BloodType, number>, bloodStock: Array<{...}> }
 * We use the `stock` map directly — it's already the shape we need.
 */
export const getBloodStock = async (): Promise<BloodStock> => {
  const empty: BloodStock = {
    'A+': 0,
    'A-': 0,
    'B+': 0,
    'B-': 0,
    'AB+': 0,
    'AB-': 0,
    'O+': 0,
    'O-': 0,
  };

  try {
    const response = await axiosInstance.get<{
      success?: boolean;
      stock?: Partial<BloodStock>;
      bloodStock?: Array<{ bloodType: string; availableUnits: number }>;
    }>('/api/hospital/blood-stock');

    // Primary path: backend returns a ready-made stock map
    if (response.data?.stock && typeof response.data.stock === 'object') {
      return { ...empty, ...response.data.stock };
    }

    // Fallback: normalise the array shape
    const items = response.data?.bloodStock;
    if (Array.isArray(items)) {
      const result = { ...empty };
      items.forEach((item) => {
        if (item.bloodType && item.bloodType in result) {
          result[item.bloodType as BloodType] = item.availableUnits ?? 0;
        }
      });
      return result;
    }
  } catch (err: any) {
    throw err?.response?.data?.error || 'Failed to fetch blood stock.';
  }

  return empty;
};

/**
 * Update Hospital Blood Stock — sends an atomic bulk update for all blood types.
 * PUT /api/hospital/blood-stock
 */
export const updateBloodStock = async (
  stock: BloodStock
): Promise<BloodStockUpdateResponse> => {
  try {
    const response = await axiosInstance.put<{
      success: boolean;
      message?: string;
      stock?: Partial<BloodStock>;
      bloodStock?: Partial<BloodStock> | Array<{ bloodType: string; availableUnits: number }>;
    }>('/api/hospital/blood-stock', {
      bloodStock: stock,
    });

    let updatedStock: BloodStock = { ...stock };

    if (response.data?.stock && typeof response.data.stock === 'object') {
      updatedStock = { ...updatedStock, ...response.data.stock };
    } else if (response.data?.bloodStock && !Array.isArray(response.data.bloodStock)) {
      updatedStock = { ...updatedStock, ...(response.data.bloodStock as BloodStock) };
    }

    return {
      success: true,
      message: response.data?.message || 'Blood stock inventory updated successfully!',
      bloodStock: updatedStock,
    };
  } catch (err: any) {
    const backendError =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      'Failed to update blood stock inventory.';
    throw new Error(backendError);
  }
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Fetch Hospital Dashboard Data
 * Combines GET /api/hospital/profile + GET /api/hospital/blood-stock
 */
export const getHospitalDashboard = async (): Promise<DashboardData> => {
  const [profile, bloodStock] = await Promise.all([
    getHospitalProfile(),
    getBloodStock(),
  ]);
  return { hospital: profile, bloodStock };
};

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * Fetch Hospital Profile
 * GET /api/hospital/profile
 *
 * Backend returns: { success, profile: sanitizeHospital(hospital) }
 * sanitizeHospital always returns `hospitalName` (not `name`).
 */
export const getHospitalProfile = async (): Promise<HospitalProfile> => {
  try {
    const response = await axiosInstance.get<{
      success: boolean;
      profile: {
        id: string;
        hospitalName: string;
        email: string;
        phone: string;
        licenseNumber: string;
        location?: { lat?: number | null; lng?: number | null; address?: string } | null;
      };
    }>('/api/hospital/profile');

    if (response.data?.profile) {
      const profileData = mapSanitizedHospital(response.data.profile);
      localStorage.setItem('hospital_user', JSON.stringify(profileData));
      return profileData;
    }
  } catch (err: any) {
    console.warn('Failed to fetch profile from server, checking local storage:', err);
  }

  const storedRaw =
    localStorage.getItem('hospital_user') || sessionStorage.getItem('hospital_user');
  if (storedRaw) {
    try {
      return JSON.parse(storedRaw) as HospitalProfile;
    } catch {
      /* corrupted storage — fall through to throw */
    }
  }

  throw new Error('Could not retrieve hospital profile.');
};

/**
 * Update Hospital Profile
 * PUT /api/hospital/profile   (name + phone)
 * POST /api/hospital/profile/change-email/request  (when email differs)
 *
 * Backend reads `hospitalName || name` — we send `hospitalName` to be explicit.
 */
export const updateHospitalProfile = async (
  payload: ProfileUpdatePayload
): Promise<ProfileUpdateResponse> => {
  const storedRaw =
    localStorage.getItem('hospital_user') || sessionStorage.getItem('hospital_user');
  if (!storedRaw) throw new Error('No hospital user session found.');

  const user = JSON.parse(storedRaw) as HospitalProfile;
  let verificationRequired = false;
  let emailChangeMessage = '';

  try {
    // If the email changed, request a verification OTP first
    if (
      payload.email &&
      payload.email.trim().toLowerCase() !== (user.email ?? '').trim().toLowerCase()
    ) {
      await axiosInstance.post('/api/hospital/profile/change-email/request', {
        newEmail: payload.email.trim(),
      });
      verificationRequired = true;
      emailChangeMessage =
        'A verification code has been sent to your new email. Confirm verification to apply email changes.';
    }

    const response = await axiosInstance.put<{
      success: boolean;
      message?: string;
      profile: {
        id: string;
        hospitalName: string;
        email: string;
        phone: string;
        licenseNumber: string;
        location?: { lat?: number | null; lng?: number | null; address?: string } | null;
      };
    }>('/api/hospital/profile', {
      hospitalName: payload.name.trim(), // backend accepts both hospitalName and name
      phone: payload.phone.trim(),
    });

    if (response.data?.success && response.data.profile) {
      const updatedHospital = mapSanitizedHospital(response.data.profile);
      // Keep the current email in local state if a change is pending verification
      updatedHospital.email = verificationRequired ? user.email : updatedHospital.email;

      localStorage.setItem('hospital_user', JSON.stringify(updatedHospital));
      sessionStorage.setItem('hospital_user', JSON.stringify(updatedHospital));

      return {
        success: true,
        verificationRequired,
        message: verificationRequired
          ? emailChangeMessage
          : response.data.message || 'Hospital profile updated successfully!',
        hospital: updatedHospital,
      };
    }
  } catch (error: any) {
    throw error?.response?.data?.error || 'Failed to update hospital profile.';
  }

  throw new Error('Could not update profile data.');
};

/**
 * Change Hospital Password
 * POST /api/hospital/profile/change-password
 */
export const changeHospitalPassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  try {
    const response = await axiosInstance.post<{
      success: boolean;
      message?: string;
    }>('/api/hospital/profile/change-password', {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      confirmPassword: payload.confirmPassword || payload.newPassword,
    });

    return {
      success: response.data.success,
      message: response.data.message || 'Hospital password updated successfully!',
    };
  } catch (error: any) {
    throw error?.response?.data?.error || 'Failed to change password.';
  }
};

/**
 * Request Password Reset Email
 * POST /api/auth/forgot-password
 */
export const requestPasswordResetEmail = async (
  email: string
): Promise<{ message: string; success?: boolean }> => {
  try {
    const response = await axiosInstance.post<{ success: boolean; message?: string }>(
      '/api/auth/forgot-password',
      { email }
    );
    return {
      success: response.data.success,
      message:
        response.data.message || `Password reset instructions sent to ${email}`,
    };
  } catch (error: any) {
    throw error?.response?.data?.error || 'Failed to request password reset.';
  }
};

/**
 * Confirm Email Change Verification Code
 * POST /api/hospital/profile/change-email/confirm
 */
export const confirmHospitalEmailChange = async (
  code: string
): Promise<{ success: boolean; message?: string; email?: string }> => {
  try {
    const response = await axiosInstance.post<{
      success: boolean;
      message?: string;
      email?: string;
    }>('/api/hospital/profile/change-email/confirm', { code });

    if (response.data.success && response.data.email) {
      const storedRaw = localStorage.getItem('hospital_user');
      if (storedRaw) {
        try {
          const u = JSON.parse(storedRaw) as HospitalProfile;
          u.email = response.data.email;
          localStorage.setItem('hospital_user', JSON.stringify(u));
          sessionStorage.setItem('hospital_user', JSON.stringify(u));
        } catch {}
      }
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Email verified and updated.',
      email: response.data.email,
    };
  } catch (error: any) {
    throw error?.response?.data?.error || 'Verification failed.';
  }
};

/**
 * Delete Hospital Account
 * DELETE /api/hospital/profile
 */
export const deleteHospitalAccount = async (): Promise<DeleteAccountResponse> => {
  try {
    const response = await axiosInstance.delete<{
      success: boolean;
      message?: string;
    }>('/api/hospital/profile');

    localStorage.clear();
    sessionStorage.clear();

    return {
      success: response.data.success,
      message: response.data.message || 'Hospital account deleted successfully.',
    };
  } catch (error: any) {
    throw error?.response?.data?.error || 'Failed to delete hospital account.';
  }
};

/**
 * Verify Hospital Password for sensitive actions
 * POST /api/hospital/profile/change-password (currentPassword only — we verify by attempting)
 *
 * NOTE: The backend does not have a dedicated "verify-password" endpoint.
 * We attempt to change the password to the same value using the supplied password
 * as proof of identity. If it succeeds we undo nothing (it is idempotent for same pw).
 * If the password is wrong the backend returns 401 and we surface that.
 */
export const verifyHospitalPassword = async (
  password: string
): Promise<VerifyPasswordResponse> => {
  try {
    // Attempt a password change to the exact same value — this is the only
    // way to verify the current password without a dedicated endpoint.
    // The backend will reject with 401 if the password is wrong.
    await axiosInstance.post('/api/hospital/profile/change-password', {
      currentPassword: password,
      newPassword: password,
      confirmPassword: password,
    });
    return { success: true, verified: true, message: 'Password authorized.' };
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 401) {
      return { success: false, verified: false, message: 'Incorrect password.' };
    }
    // For any other error (network, 500, etc.) we can't determine validity — fail safe
    return { success: false, verified: false, message: 'Could not verify password.' };
  }
};

// ─── Blood Requests ───────────────────────────────────────────────────────────

/**
 * Create a new Blood Request
 * POST /api/hospital/blood-requests
 *
 * Backend expects: { bloodType, quantityNeeded, isEmergency, description, closesAt }
 * Backend returns: { success, message, requestId, notifiedDonorCount }
 */
export const createBloodRequest = async (
  payload: BloodRequestPayload
): Promise<BloodRequestResponse> => {
  const isEmergency = payload.requestType === 'Emergency';
  const closesAt = payload.closingDateTime
    ? new Date(payload.closingDateTime).toISOString()
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  try {
    const response = await axiosInstance.post<{
      success?: boolean;
      message?: string;
      requestId?: string;
      notifiedDonorCount?: number;
    }>('/api/hospital/blood-requests', {
      bloodType: payload.bloodType,
      quantityNeeded: payload.quantity,
      isEmergency,
      description: payload.description || '',
      closesAt,
    });

    // Build a local BloodRequest representation using the returned requestId.
    // Status from backend is 'open'; we normalise to 'ACTIVE' for the frontend enum.
    const newRequest: BloodRequest = {
      id: String(response.data?.requestId || `req_${Date.now()}`),
      bloodType: payload.bloodType,
      quantity: payload.quantity,
      requestType: payload.requestType,
      description: payload.description,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      closingDateTime: closesAt,
      acceptedDonors: [],
    };

    return {
      success: true,
      message:
        response.data?.message ||
        `Request created. ${response.data?.notifiedDonorCount ?? 0} donors notified.`,
      request: newRequest,
    };
  } catch (error: any) {
    throw error?.response?.data?.error || 'Failed to create blood request.';
  }
};

/**
 * Fetch Blood Requests with optional type filter
 * GET /api/hospital/blood-requests?urgency=emergency|notUrgent
 *
 * Backend returns: { success, requests: [{id, bloodType, quantityNeeded, isEmergency,
 *   description, status ('open'|'closed'), closedReason, createdAt, closesAt,
 *   closedAt, notifiedDonorCount, acceptedCount, deniedCount, pendingCount}] }
 *
 * Status mapping: backend 'open' → frontend 'ACTIVE', backend 'closed' → frontend 'CLOSED'
 */
export const getBloodRequests = async (
  filter?: RequestType | 'All'
): Promise<BloodRequest[]> => {
  const urgency =
    filter === 'Emergency' ? 'emergency' : filter === 'Normal' ? 'notUrgent' : undefined;

  try {
    const res = await axiosInstance.get<{
      success: boolean;
      requests: Array<{
        id: string;
        bloodType: BloodType;
        quantityNeeded: number;
        isEmergency: boolean;
        description: string;
        status: 'open' | 'closed';
        closedReason?: string;
        createdAt: string;
        closesAt: string;
        closedAt?: string;
        notifiedDonorCount: number;
        acceptedCount: number;
        deniedCount: number;
        pendingCount: number;
      }>;
    }>('/api/hospital/blood-requests', { params: { urgency } });

    if (!res.data?.success || !Array.isArray(res.data.requests)) return [];

    return res.data.requests.map((r) => ({
      id: String(r.id),
      bloodType: r.bloodType,
      quantity: r.quantityNeeded,
      requestType: r.isEmergency ? ('Emergency' as const) : ('Normal' as const),
      description: r.description,
      // Backend uses 'open'/'closed'; frontend enum uses 'ACTIVE'/'CLOSED'
      status: (r.status === 'open' ? 'ACTIVE' : 'CLOSED') as BloodRequest['status'],
      createdAt: r.createdAt,
      closingDateTime: r.closesAt,
      acceptedCount: r.acceptedCount,
      acceptedDonors: [], // loaded lazily via getBloodRequestResponses when the modal opens
    }));
  } catch (err: any) {
    throw err?.response?.data?.error || 'Failed to load blood requests.';
  }
};

/**
 * Fetch accepted donor responses for a single blood request.
 * GET /api/hospital/blood-requests/{id}/responses
 *
 * Backend returns: { success, requestStatus, accepted: [{id, name, gender, bloodType, phone}],
 *   deniedCount, pendingCount }
 *
 * Call this separately (e.g. when opening a request detail modal) to avoid
 * the N+1 problem of fetching responses for every request on list load.
 */
export const getBloodRequestResponses = async (
  requestId: string
): Promise<{
  accepted: AcceptedDonor[];
  deniedCount: number;
  pendingCount: number;
  requestStatus: string;
}> => {
  try {
    const res = await axiosInstance.get<{
      success: boolean;
      requestStatus: string;
      accepted: Array<{
        id: string;
        name: string;
        gender: string;
        bloodType: BloodType;
        phone: string;
      }>;
      deniedCount: number;
      pendingCount: number;
    }>(`/api/hospital/blood-requests/${requestId}/responses`);

    return {
      requestStatus: res.data?.requestStatus ?? 'unknown',
      accepted: (res.data?.accepted ?? []).map((d) => ({
        id: String(d.id),
        name: d.name,
        bloodType: d.bloodType,
        phone: d.phone,
        acceptedAt: new Date().toISOString(),
      })),
      deniedCount: res.data?.deniedCount ?? 0,
      pendingCount: res.data?.pendingCount ?? 0,
    };
  } catch (error: any) {
    throw error?.response?.data?.error || 'Failed to fetch request responses.';
  }
};

/**
 * Fetch a single Blood Request by ID (uses the list endpoint as source of truth)
 */
export const getBloodRequestById = async (id: string): Promise<BloodRequest> => {
  const requests = await getBloodRequests('All');
  const found = requests.find((r) => r.id === id);
  if (found) return found;
  throw new Error('Blood request not found.');
};

/**
 * Close a Blood Request
 * PATCH /api/hospital/blood-requests/{id}/close
 */
export const closeBloodRequest = async (
  id: string
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await axiosInstance.patch<{
      success: boolean;
      message?: string;
    }>(`/api/hospital/blood-requests/${id}/close`);

    return {
      success: response.data.success,
      message: response.data.message || 'Request closed.',
    };
  } catch (error: any) {
    throw error?.response?.data?.error || 'Failed to close request.';
  }
};

// ─── Hospital Search ──────────────────────────────────────────────────────────

/**
 * Search Hospitals by Blood Type
 * GET /api/hospital/search?bloodType={bloodType}&quantity={quantity}
 *
 * Backend returns: { success, results: [{id, name, email, phone, licenseNumber,
 *   location: {lat, lng, address}, hasStock}] }
 */
export const searchHospitals = async (
  bloodType: BloodType,
  quantity: number = 1
): Promise<HospitalSearchResult[]> => {
  try {
    const res = await axiosInstance.get<{
      success: boolean;
      results: Array<{
        id: string;
        name: string;
        email: string;
        phone: string;
        licenseNumber: string;
        location?: { lat?: number | null; lng?: number | null; address?: string } | null;
        hasStock?: boolean;
      }>;
    }>('/api/hospital/search', {
      params: { bloodType, quantity },
    });

    if (!res.data?.success || !Array.isArray(res.data.results)) return [];

    return res.data.results.map((h) => ({
      id: String(h.id),
      name: h.name,
      phone: h.phone,
      email: h.email,
      licenseNumber: h.licenseNumber,
      location: h.location
        ? {
            lat: h.location.lat ?? 9.0108,
            lng: h.location.lng ?? 38.7613,
          }
        : null,
      stockQuantity: quantity, // quantity searched, not the hospital's actual units (not exposed by API)
    }));
  } catch (err: any) {
    throw err?.response?.data?.error || 'Failed to search hospitals.';
  }
};