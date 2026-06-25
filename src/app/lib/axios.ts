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