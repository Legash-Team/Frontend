import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginHospital } from '@/services/hospitalService';

export interface HospitalUser {
  id?: string;
  name?: string;
  hospitalName?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  role?: string;
  verificationStatus?: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
}

export interface AuthContextType {
  user: HospitalUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{
    token?: string;
    user?: HospitalUser;
    role?: string;
    success?: boolean;
    message?: string;
  }>;
  logout: () => void;
  updateUser: (updatedUser: Partial<HospitalUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'token';
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'hospital_user';

// Temporary development hospital user for dev bypass
export const DEV_HOSPITAL_USER: HospitalUser = {
  id: 'dev_semera_hospital',
  name: 'Semera General Hospital',
  email: 'demo@hospital.test',
  phone: '+251336660123',
  licenseNumber: 'MOH-HOSP-SEM-001',
  role: 'hospital',
  verificationStatus: 'verified',
  location: {
    lat: 11.792,
    lng: 41.008,
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isDevBypass = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

  const [token, setToken] = useState<string | null>(() => {
    const stored =
      localStorage.getItem(TOKEN_KEY) ||
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(AUTH_TOKEN_KEY);
    if (stored) return stored;
    return isDevBypass ? 'dev_bypass_mock_token' : null;
  });

  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  const [user, setUser] = useState<HospitalUser | null>(() => {
    const storedUser =
      localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        // fallback
      }
    }
    return isDevBypass ? DEV_HOSPITAL_USER : null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Initialize and validate auth session
  useEffect(() => {
    try {
      const storedToken =
        localStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem(AUTH_TOKEN_KEY) ||
        sessionStorage.getItem(TOKEN_KEY) ||
        sessionStorage.getItem(AUTH_TOKEN_KEY);

      const storedRefreshToken =
        localStorage.getItem(REFRESH_TOKEN_KEY) ||
        sessionStorage.getItem(REFRESH_TOKEN_KEY);

      const storedUser =
        localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

      if (storedToken) {
        setToken(storedToken);
        if (storedRefreshToken) {
          setRefreshToken(storedRefreshToken);
        }
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(isDevBypass ? DEV_HOSPITAL_USER : null);
          }
        }
      } else if (isDevBypass) {
        setToken('dev_bypass_mock_token');
        setUser(DEV_HOSPITAL_USER);
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isDevBypass]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await loginHospital(credentials);

      const resolvedToken = res.token || res.auth_token;
      if (!resolvedToken) {
        throw new Error(res.message || 'Authentication failed: No token received.');
      }

      const resolvedUser: HospitalUser = {
        id: res.user?.id || (res.hospital as unknown as HospitalUser)?.id || 'hospital_user',
        name:
          res.user?.name ||
          res.hospital?.name ||
          'St. Paul Hospital Millennium Medical College',
        email: res.user?.email || res.hospital?.email || credentials.email,
        phone: res.hospital?.phone || '+251112750123',
        licenseNumber: res.hospital?.licenseNumber || 'MOH-HOSP-2026-0891',
        role: res.role || 'hospital',
        verificationStatus: res.verificationStatus || 'verified',
        location: res.hospital?.location || { lat: 9.0108, lng: 38.7613 },
      };

      // Store in localStorage & sessionStorage for token persistence
      localStorage.setItem(TOKEN_KEY, resolvedToken);
      localStorage.setItem(AUTH_TOKEN_KEY, resolvedToken);
      sessionStorage.setItem(TOKEN_KEY, resolvedToken);
      sessionStorage.setItem(AUTH_TOKEN_KEY, resolvedToken);

      if (res.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
        sessionStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
        setRefreshToken(res.refreshToken);
      }

      localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
      sessionStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));

      setToken(resolvedToken);
      setUser(resolvedUser);

      return {
        token: resolvedToken,
        user: resolvedUser,
        role: res.role,
        success: true,
        message: res.message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    if (isDevBypass) {
      setToken(null);
      setUser(null);
    } else {
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: Partial<HospitalUser>) => {
    setUser((prev) => {
      const merged = { ...(prev || (isDevBypass ? DEV_HOSPITAL_USER : {})), ...updatedUser };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      sessionStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const isAuthenticated = isDevBypass || Boolean(token);

  return (
    <AuthContext.Provider
      value={{
        user: user || (isDevBypass ? DEV_HOSPITAL_USER : null),
        token,
        refreshToken,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    const isDevBypass = import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';
    return {
      user: isDevBypass ? DEV_HOSPITAL_USER : null,
      token: isDevBypass ? 'dev_bypass_mock_token' : null,
      refreshToken: null,
      isAuthenticated: isDevBypass,
      isLoading: false,
      login: async () => ({ success: true }),
      logout: () => {},
      updateUser: () => {},
    };
  }
  return context;
};

export default AuthContext;
