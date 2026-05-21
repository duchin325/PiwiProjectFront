'use client';
import { useEffect, useState } from 'react';
import type { Client } from '@/app/lib/types';
import * as clientsData from '@/app/lib/data/clients';
import { notify } from '@/app/lib/notify';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await clientsData.listClients();
      setClients(result);
      setError(null);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error cargando clientes'));
      notify.error('No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const create = async (input: Omit<Client, 'id'>) => {
    const request = clientsData.createClient(input);
    const created = await notify.promise(request, {
      loading: 'Creando cliente...',
      success: 'Cliente creado',
      error: 'No se pudo crear el cliente',
    });

    setClients((prev) => [created, ...prev]);
    return created;
  };

  const update = async (id: string, patch: Partial<Client>) => {
    const request = clientsData.updateClient(id, patch);
    const updatedClient = await notify.promise(request, {
      loading: 'Actualizando cliente...',
      success: 'Cliente actualizado',
      error: 'No se pudo actualizar el cliente',
    });

    setClients((prev) =>
      prev.map((client) => (client.id === id ? updatedClient : client))
    );

    return updatedClient;
  };

  const remove = async (id: string) => {
    const request = clientsData.deleteClient(id);
    await notify.promise(request, {
      loading: 'Eliminando cliente...',
      success: 'Cliente eliminado',
      error: 'No se pudo eliminar el cliente',
    });

    setClients((prev) => prev.filter((client) => client.id !== id));
  };

  useEffect(() => {
    refresh();
  }, []);

  return { data: clients, loading, error, refresh, create, update, remove };
}
