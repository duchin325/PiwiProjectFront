'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockApi } from '../lib/mockApi';
import type { User } from '../lib/types';
import { notify } from '../lib/notify';
import { API_BASE_URL } from '../lib/data/source';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

interface AuthContextShape {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    role: 'admin' | 'operator',
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | null>(null);

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setBooting(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      let storedToken: string;
      let storedUser: User;

      if (USE_MOCK) {
        const result = await mockApi.login(email.trim(), password);
        storedToken = result.token;
        storedUser = result.user;
      } else {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email.trim(), password }),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || 'Credenciales incorrectas');
        }
        const data: { access_token: string } = await res.json();
        storedToken = data.access_token;
        storedUser = {
          id: 'api-user',
          name: email.trim(),
          email: email.trim(),
          role: 'admin' as const,
          password: '',
        };
      }

      setUser(storedUser);
      setToken(storedToken);
      localStorage.setItem('token', storedToken);
      localStorage.setItem('user', JSON.stringify(storedUser));

      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: storedToken }),
      });

      notify.success(`Bienvenido, ${storedUser.name}`);
    } catch (error: unknown) {
      notify.error(getErrorMessage(error, 'Error al iniciar sesion'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    role: 'admin' | 'operator',
    password: string
  ) => {
    setLoading(true);
    try {
      const { token, user } = await mockApi.register(name.trim(), email.trim(), role, password);
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      notify.success('Cuenta creada y sesion iniciada');
    } catch (error: unknown) {
      notify.error(getErrorMessage(error, 'No se pudo registrar la cuenta'));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      await fetch('/api/auth/logout', { method: 'POST' });
      notify.info('Sesion cerrada');
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading]
  );

  if (booting) {
    return (
      <div className="min-h-dvh grid place-items-center bg-gray-50">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto" />
          <p className="font-semibold text-gray-900">Piwi Encomiendas</p>
          <p className="text-sm text-gray-600">Cargando sesion...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
