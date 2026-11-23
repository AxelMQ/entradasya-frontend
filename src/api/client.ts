import axios from 'axios';

// Resolve base URL for API Gateway or direct proxy
const getBaseUrl = (): string => {
  const gateway = import.meta.env.VITE_API_GATEWAY_URL;
  if (gateway) {
    return gateway.endsWith('/api/v1') ? gateway : `${gateway.replace(/\/+$/, '')}/api/v1`;
  }
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.endsWith('/api/v1') ? apiUrl : `${apiUrl.replace(/\/+$/, '')}/api/v1`;
  }
  return '/api/v1';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Auto-inject JWT Bearer token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('entradasya_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Intercept 401 Unauthorized responses to clear expired credentials
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token only if it's an authenticated route (avoid clearing during normal failed login attempt)
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthEndpoint) {
        localStorage.removeItem('entradasya_token');
        localStorage.removeItem('entradasya_user');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // If not already in login, redirect
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
