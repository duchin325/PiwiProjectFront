'use client';
import { useEffect, useState } from 'react';
import * as shipmentsData from '@/app/lib/data/shipments';
import { notify } from '@/app/lib/notify';
import type { Shipment, ShipmentStatus } from '@/app/lib/types';

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

type ShipmentInput = Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>;
type ShipmentPatch = Partial<ShipmentInput>;

export function useShipments() {
  const [data, setData] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const result = await shipmentsData.listShipments();
      setData(result);
      setError(null);
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Error cargando encomiendas'));
    } finally {
      setLoading(false);
    }
  };

  const create = async (input: ShipmentInput) => {
    const request = shipmentsData.createShipment(input);
    const created = await notify.promise(request, {
      loading: 'Creando encomienda...',
      success: 'Encomienda creada',
      error: 'No se pudo crear la encomienda',
    });

    setData((prev) => [created, ...prev]);
    return created;
  };

  const update = async (id: string, patch: ShipmentPatch) => {
    const request = shipmentsData.updateShipment(id, patch);
    const updatedShipment = await notify.promise(request, {
      loading: 'Actualizando encomienda...',
      success: 'Encomienda actualizada',
      error: 'No se pudo actualizar la encomienda',
    });

    setData((prev) =>
      prev.map((shipment) => (shipment.id === id ? updatedShipment : shipment))
    );

    return updatedShipment;
  };

  const changeStatus = async (id: string, status: ShipmentStatus) => {
    return update(id, { status });
  };

  const remove = async (id: string) => {
    const request = shipmentsData.deleteShipment(id);
    await notify.promise(request, {
      loading: 'Eliminando encomienda...',
      success: 'Encomienda eliminada',
      error: 'No se pudo eliminar la encomienda',
    });

    setData((prev) => prev.filter((shipment) => shipment.id !== id));
  };

  useEffect(() => {
    refresh();
  }, []);

  return { data, loading, error, refresh, create, update, changeStatus, remove };
}
