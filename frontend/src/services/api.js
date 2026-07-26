import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = /\/auth\/(login|register)/.test(
      error.config?.url || '',
    );
    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('pm_token');
      localStorage.removeItem('pm_user');
      if (window.location.pathname !== '/login')
        window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export default api;
