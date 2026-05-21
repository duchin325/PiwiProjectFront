'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const roleLabels = {
  admin: 'Administrador',
  operator: 'Operador',
};

export function Topbar() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [closing, setClosing] = useState(false);

  const handleLogout = async () => {
    setClosing(true);
    try {
      await logout();
      router.replace('/auth/login');
    } finally {
      setClosing(false);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b">
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="md:hidden font-semibold">Piwi Encomiendas</div>
        <div className="flex items-center gap-3 ml-auto">
          {user && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{roleLabels[user.role]}</p>
            </div>
          )}
          <button className="btn" onClick={handleLogout} disabled={closing || loading}>
            {closing || loading ? 'Cerrando...' : 'Salir'}
          </button>
        </div>
      </div>
    </header>
  );
}
