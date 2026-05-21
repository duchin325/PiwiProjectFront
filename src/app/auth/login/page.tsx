'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('adm_123');
  const [error, setError] = useState<string | null>(null);

  const fillAdminDemo = () => {
    setEmail('admin@demo.com');
    setPassword('adm_123');
    setError(null);
  };

  const fillOperatorDemo = () => {
    setEmail('op@demo.com');
    setPassword('op123');
    setError(null);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error al iniciar sesion'));
    }
  };

  return (
    <div className="min-h-dvh grid place-items-center p-6 bg-gray-50">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 mx-auto" />
          <h1 className="text-2xl font-semibold">Iniciar sesion</h1>
          <p className="text-sm text-gray-600">
            Accede al panel para administrar viajes, encomiendas y hojas de ruta.
          </p>
        </div>

        <div className="card p-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Accesos demo
          </p>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className="btn" onClick={fillAdminDemo}>
              Cargar admin
            </button>
            <button type="button" className="btn" onClick={fillOperatorDemo}>
              Cargar operador
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="card w-full p-6 space-y-4">
          {error && <div className="text-sm text-red-600">{error}</div>}

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
            <label className="label">Contrasena</label>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-sm text-gray-600">
            No tienes cuenta?{' '}
            <Link className="text-blue-700 underline" href="/auth/register">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
