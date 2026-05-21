import { api } from '@/app/lib/axios';
import { mockApi } from '@/app/lib/mockApi';
import { logMockFallback, resolveMockMode } from '@/app/lib/data/source';
import type { Client } from '@/app/lib/types';

const USE_MOCK = resolveMockMode(process.env.NEXT_PUBLIC_USE_MOCK_CLIENTS);

type BackendClient = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
};

const normalizeClient = (client: BackendClient): Client => ({
  id: String(client.id),
  name: client.name,
  email: client.email,
  phone: client.phone ?? '',
  address: client.address ?? '',
});

const toBackendClient = (input: Omit<Client, 'id'> | Partial<Client>) => ({
  ...(input.name !== undefined ? { name: input.name } : {}),
  ...(input.email !== undefined ? { email: input.email } : {}),
  ...(input.phone !== undefined ? { phone: input.phone || null } : {}),
  ...(input.address !== undefined ? { address: input.address || null } : {}),
});

export async function listClients(): Promise<Client[]> {
  if (USE_MOCK) return mockApi.listClients();
  try {
    const { data } = await api.get<BackendClient[]>('/clients');
    return data.map(normalizeClient);
  } catch (err) {
    logMockFallback('Error al obtener clientes', err);
    return mockApi.listClients();
  }
}

export async function getClient(id: string): Promise<Client> {
  if (USE_MOCK) return mockApi.getClient(id);
  try {
    const { data } = await api.get<BackendClient>(`/clients/${id}`);
    return normalizeClient(data);
  } catch (err) {
    logMockFallback(`No se pudo obtener el cliente ${id}`, err);
    return mockApi.getClient(id);
  }
}

export async function createClient(
  input: Omit<Client, 'id'>
): Promise<Client> {
  if (USE_MOCK) return mockApi.createClient(input);
  try {
    const payload = toBackendClient(input);
    const { data } = await api.post<{ id: number }>('/clients', payload);
    return getClient(String(data.id));
  } catch (err) {
    logMockFallback('Error creando cliente', err);
    return mockApi.createClient(input);
  }
}

export async function updateClient(id: string, patch: Partial<Client>): Promise<Client> {
   if (USE_MOCK) return mockApi.updateClient(id, patch);
  try {
    const payload = toBackendClient(patch);
    await api.put(`/clients/${id}`, payload);
    return getClient(id);
  } catch (err) {
    logMockFallback(`No se pudo actualizar el cliente ${id}`, err);
    return mockApi.updateClient(id, patch);
  }
}

export async function deleteClient(id: string): Promise<void> {
  if (USE_MOCK) {
    await mockApi.deleteClient(id);
    return;
  }
  try {
    await api.delete(`/clients/${id}`);
  } catch (err) {
    logMockFallback(`No se pudo eliminar el cliente ${id}`, err);
    await mockApi.deleteClient(id);
  }
}
