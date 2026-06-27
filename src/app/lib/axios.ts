import axios from 'axios';
import { API_BASE_URL } from '@/app/lib/data/source';

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            if (config.headers) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
    }
    return config;
});

let isHandlingUnauthorized = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/auth/') &&
      !isHandlingUnauthorized
    ) {
      isHandlingUnauthorized = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      fetch('/api/auth/logout', { method: 'POST' })
        .catch(() => {})
        .finally(() => {
          window.location.href = '/auth/login';
        });
    }
    return Promise.reject(error);
  }
);