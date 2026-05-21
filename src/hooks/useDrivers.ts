'use client';
import { useEffect, useState } from 'react';
import type { Driver } from '@/app/lib/types';
import * as driversData from '@/app/lib/data/drivers';
import { notify } from '@/app/lib/notify';

export function useDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await driversData.listDrivers();
      setDrivers(result);
    } catch {
      notify.error('No se pudieron cargar los conductores');
    } finally {
      setLoading(false);
    }
  };

  const create = async (input: Omit<Driver, 'id'>) => {
    const created = await notify.promise(driversData.createDriver(input), {
      loading: 'Creando conductor...',
      success: 'Conductor creado',
      error: 'No se pudo crear el conductor',
    });

    setDrivers((prev) => [created, ...prev]);
    return created;
  };

  const update = async (id: string, patch: Partial<Driver>) => {
    const updated = await notify.promise(driversData.updateDriver(id, patch), {
      loading: 'Actualizando conductor...',
      success: 'Conductor actualizado',
      error: 'No se pudo actualizar el conductor',
    });

    setDrivers((prev) => prev.map((driver) => (driver.id === id ? updated : driver)));
    return updated;
  };

  const remove = async (id: string) => {
    await notify.promise(driversData.deleteDriver(id), {
      loading: 'Eliminando conductor...',
      success: 'Conductor eliminado',
      error: 'No se pudo eliminar el conductor',
    });

    setDrivers((prev) => prev.filter((driver) => driver.id !== id));
  };

  useEffect(() => {
    refresh();
  }, []);

  return { data: drivers, loading, refresh, create, update, remove };
}
