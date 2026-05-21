'use client';
import { useAuthContext } from '../app/context/AuthProvider';

export const useAuth = () => useAuthContext();