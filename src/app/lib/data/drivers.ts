import { api } from '@/app/lib/axios';
import { mockApi } from '@/app/lib/mockApi';
import { logMockFallback, resolveMockMode } from '@/app/lib/data/source';
import type { Driver } from '@/app/lib/types';

const USE_MOCK_DRIVERS = resolveMockMode(process.env.NEXT_PUBLIC_USE_MOCK_DRIVERS);

type BackendDriver = {
  id: number;
  name: string;
  phone?: string | null;
  licenseNumber: string;
  truckPlate?: string | null;
  notes?: string | null;
};

const normalizeDriver = (driver: BackendDriver): Driver => ({
  id: String(driver.id),
  name: driver.name,
  phone: driver.phone ?? '',
  licenseNumber: driver.licenseNumber,
  truckPlate: driver.truckPlate ?? '',
  notes: driver.notes ?? '',
});

const toBackendDriver = (input: Omit<Driver, 'id'>) => ({
  name: input.name,
  phone: input.phone || null,
  licenseNumber: input.licenseNumber,
  truckPlate: input.truckPlate || null,
  notes: input.notes || null,
});

export async function listDrivers(): Promise<Driver[]> {
  if (USE_MOCK_DRIVERS) return mockApi.listDrivers();
  try {
    const { data } = await api.get<BackendDriver[]>('/drivers');
    return data.map(normalizeDriver);
  } catch (err) {
    logMockFallback('Error al obtener conductores', err);
    return mockApi.listDrivers();
  }
}

export async function createDriver(input: Omit<Driver, 'id'>): Promise<Driver> {
  if (USE_MOCK_DRIVERS) return mockApi.createDriver(input);
  try {
    const payload = toBackendDriver(input);
    const { data } = await api.post<{ id: number }>('/drivers', payload);
    return { ...input, id: String(data.id) };
  } catch (err) {
    logMockFallback('Error creando conductor', err);
    return mockApi.createDriver(input);
  }
}

export async function updateDriver(id: string, patch: Partial<Driver>): Promise<Driver> {
  if (USE_MOCK_DRIVERS) return mockApi.updateDriver(id, patch);
  try {
    const payload = {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone || null } : {}),
      ...(patch.licenseNumber !== undefined ? { licenseNumber: patch.licenseNumber } : {}),
      ...(patch.truckPlate !== undefined ? { truckPlate: patch.truckPlate || null } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes || null } : {}),
    };

    await api.put(`/drivers/${id}`, payload);
    const drivers = await listDrivers();
    const updated = drivers.find((driver) => driver.id === id);
    if (!updated) {
      throw new Error('Conductor no encontrado luego de actualizar');
    }
    return updated;
  } catch (err) {
    logMockFallback(`No se pudo actualizar el conductor ${id}`, err);
    return mockApi.updateDriver(id, patch);
  }
}

export async function deleteDriver(id: string): Promise<void> {
  if (USE_MOCK_DRIVERS) {
    await mockApi.deleteDriver(id);
    return;
  }

  try {
    await api.delete(`/drivers/${id}`);
  } catch (err) {
    logMockFallback(`No se pudo eliminar el conductor ${id}`, err);
    await mockApi.deleteDriver(id);
  }
}
