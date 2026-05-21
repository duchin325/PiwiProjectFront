'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '../../lib/types';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [name, setName] = useState('Operador Demo');
  const [email, setEmail] = useState('op@demo.com');
  const [role, setRole] = useState<Role>('operator');
  const [password, setPassword] = useState('op123');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await register(name, email, role, password);
      router.replace('/dashboard');
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'No se pudo registrar'));
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center p-6 bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto" />
          <h1 className="text-2xl font-semibold">Crear cuenta</h1>
          <p className="text-sm text-gray-600">
            Registra un usuario nuevo y entra directo al sistema.
          </p>
        </div>

        <form onSubmit={onSubmit} className="card w-full p-6 space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}

          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Rol</label>
            <select
              className="input"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              <option value="admin">Administrador</option>
              <option value="operator">Operador</option>
            </select>
          </div>

          <div>
            <label className="label">Contrasena</label>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creando...' : 'Crear cuenta e ingresar'}
          </button>

          <p className="text-sm text-gray-600">
            Ya tienes cuenta?{' '}
            <Link className="text-blue-700 underline" href="/auth/login">
              Iniciar sesion
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
