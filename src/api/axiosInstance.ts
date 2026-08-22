import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:3000';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
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
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
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
