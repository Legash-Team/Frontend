import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  '';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('auth_token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // --- TEMPORARY MOCK ---
    if (config.url?.includes('/api/auth/login')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          token: "mock_superadmin_token_123",
          role: "superadmin",
          permissions: { canApproveHospitals: true, canPostEvents: true },
          user: { id: "superadmin_id", name: "Mock Super Admin", email: "admin@legash.com" }
        }
      });
    }

    if (config.url?.includes('/api/superadmin/hospitals/stock')) {
      return Promise.reject({
        isMock: true,
        data: { success: true, data: [
          { hospitalName: 'Addis Ababa Central Hospital', location: { address: 'Addis Ababa, Ethiopia' }, phone: '+251911234567', bloodType: 'A+', availableUnits: 45 },
          { hospitalName: 'St. Pauls Hospital Millennium', location: { address: 'Addis Ababa, Ethiopia' }, phone: '+251922345678', bloodType: 'B+', availableUnits: 30 }
        ]}
      });
    }

    if (config.url?.includes('/api/superadmin/analytics/hospitals')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          data: {
            nationalTotals: { 'A+': 450, 'A-': 120, 'B+': 320, 'B-': 90, 'AB+': 180, 'AB-': 40, 'O+': 890, 'O-': 210 },
            topHospitals: [{ hospitalName: 'Black Lion Hospital', totalUnits: 1200 }],
            bottomHospitals: [{ hospitalName: 'Rural Clinic A', totalUnits: 5 }],
            trends: [
              { date: 'Oct 01', 'A+': 400, 'O+': 800, 'B+': 300 },
              { date: 'Oct 02', 'A+': 420, 'O+': 850, 'B+': 310 }
            ]
          }
        }
      });
    }

    if (config.url?.includes('/api/superadmin/hospitals/pending')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          hospitals: [
            {
              id: "hosp_101",
              hospitalName: "Tikur Anbessa Specialized Hospital",
              licenseNumber: "MED-ETH-2024-8841",
              email: "contact@tikuranbessa.gov.et",
              phone: "+251 11 551 1211",
              createdAt: new Date().toISOString(),
              location: { address: "Addis Ababa, Lideta Sub City", lat: 9.0142, lng: 38.7485 }
            },
            {
              id: "hosp_102",
              hospitalName: "St. Paul's Hospital Millennium Medical College",
              licenseNumber: "MED-ETH-2023-4519",
              email: "info@sphmmc.edu.et",
              phone: "+251 11 275 0125",
              createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
              location: { address: "Addis Ababa, Gulele Sub City", lat: 9.0578, lng: 38.7369 }
            },
            {
              id: "hosp_103",
              hospitalName: "Zewditu Memorial Hospital",
              licenseNumber: "MED-ETH-2024-1102",
              email: "admin@zewdituhospital.org",
              phone: "+251 11 551 8085",
              createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
              location: { address: "Addis Ababa, Kirkos Sub City", lat: 9.0177, lng: 38.7612 }
            }
          ]
        }
      });
    }

    if (config.url?.match(/\/api\/superadmin\/hospitals\/.*\/approve/)) {
      return Promise.reject({
        isMock: true,
        data: { success: true, message: "Hospital approved successfully." }
      });
    }

    if (config.url?.match(/\/api\/superadmin\/hospitals\/.*\/reject/)) {
      return Promise.reject({
        isMock: true,
        data: { success: true, message: "Hospital rejected successfully." }
      });
    }

    if (config.url?.includes('/api/hospital/profile')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          profile: {
            id: "hosp_profile_01",
            hospitalName: "Addis General Hospital",
            email: "contact@hospital.org",
            phone: "+251911234567",
            licenseNumber: "LIC-2024-9988",
            location: { address: "Bole Road, Addis Ababa", lat: 9.0054, lng: 38.7636 }
          }
        }
      });
    }

    if (config.url?.includes('/api/hospital/blood-stock')) {
      return Promise.reject({
        isMock: true,
        data: {
          success: true,
          stock: { 'A+': 32, 'A-': 8, 'B+': 20, 'B-': 5, 'AB+': 12, 'AB-': 3, 'O+': 45, 'O-': 15 }
        }
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // --- TEMPORARY MOCK ---
    if (error.isMock) {
      return Promise.resolve({ data: error.data, status: 200 });
    }

    // If 401 Unauthorized occurs on a protected resource, don't redirect if it was a login attempt
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      if (!requestUrl.includes('/login') && !requestUrl.includes('/auth/login')) {
        // Clear expired auth data
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('hospital_user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('hospital_user');
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
