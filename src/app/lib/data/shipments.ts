import { api } from '@/app/lib/axios';
import { mockApi } from '@/app/lib/mockApi';
import { logMockFallback, resolveMockMode } from '@/app/lib/data/source';
import type { Shipment } from '@/app/lib/types';

const USE_MOCK_SHIPMENTS = resolveMockMode(process.env.NEXT_PUBLIC_USE_MOCK_SHIPMENTS);

type BackendOrderStatus = 'pendiente' | 'en tránsito' | 'entregado';

type BackendOrder = {
  id: number;
  clientId: number;
  origin: string;
  destination: string;
  originAddress?: string | null;
  destinationAddress?: string | null;
  senderName?: string | null;
  senderPhone?: string | null;
  recipientName?: string | null;
  recipientPhone?: string | null;
  amountToCollect?: number | null;
  notes?: string | null;
  weight: number;
  volume: number | null;
  status: BackendOrderStatus;
  createdAt: string;
};

const orderStatusToShipmentStatus: Record<BackendOrderStatus, Shipment['status']> = {
  pendiente: 'pending',
  'en tránsito': 'active',
  entregado: 'completed',
};

const shipmentStatusToOrderStatus: Record<Shipment['status'], BackendOrderStatus> = {
  pending: 'pendiente',
  active: 'en tránsito',
  completed: 'entregado',
};

const buildShipmentCode = (id: number) => `ORD-${String(id).padStart(4, '0')}`;

const normalizeShipment = (order: BackendOrder): Shipment => ({
  id: String(order.id),
  code: buildShipmentCode(order.id),
  clientId: String(order.clientId),
  origin: order.origin,
  destination: order.destination,
  originAddress: order.originAddress ?? '',
  destinationAddress: order.destinationAddress ?? '',
  senderName: order.senderName ?? '',
  senderPhone: order.senderPhone ?? '',
  recipientName: order.recipientName ?? '',
  recipientPhone: order.recipientPhone ?? '',
  amountToCollect: order.amountToCollect ?? undefined,
  notes: order.notes ?? '',
  status: orderStatusToShipmentStatus[order.status] ?? 'pending',
  createdAt: order.createdAt,
  updatedAt: order.createdAt,
});

const toBackendOrderBase = (
  input: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'> | Partial<Shipment>
) => ({
  ...(input.clientId !== undefined ? { clientId: Number(input.clientId) } : {}),
  ...(input.origin !== undefined ? { origin: input.origin } : {}),
  ...(input.destination !== undefined ? { destination: input.destination } : {}),
  ...(input.status !== undefined ? { status: shipmentStatusToOrderStatus[input.status] } : {}),
});

const toBackendOrderCreate = (input: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>) => ({
  ...toBackendOrderBase(input),
  weight: 0,
  volume: null,
});

export async function listShipments(): Promise<Shipment[]> {
  if (USE_MOCK_SHIPMENTS) return mockApi.listShipments();
  try {
    const { data } = await api.get<BackendOrder[]>('/orders');
    return data.map(normalizeShipment);
  } catch (err) {
    logMockFallback('Error al obtener encomiendas', err);
    return mockApi.listShipments();
  }
}

export async function getShipment(id: string): Promise<Shipment> {
  if (USE_MOCK_SHIPMENTS) return mockApi.getShipment(id);
  try {
    const { data } = await api.get<BackendOrder>(`/orders/${id}`);
    return normalizeShipment(data);
  } catch (err) {
    logMockFallback(`No se pudo obtener la encomienda ${id}`, err);
    return mockApi.getShipment(id);
  }
}

export async function createShipment(
  input: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Shipment> {
  if (USE_MOCK_SHIPMENTS) return mockApi.createShipment(input);
  try {
    const payload = toBackendOrderCreate(input);
    const { data } = await api.post<{ id: number }>('/orders', payload);
    return getShipment(String(data.id));
  } catch (err) {
    logMockFallback('Error creando encomienda', err);
    return mockApi.createShipment(input);
  }
}

export async function updateShipment(id: string, patch: Partial<Shipment>): Promise<Shipment> {
  if (USE_MOCK_SHIPMENTS) return mockApi.updateShipment(id, patch);
  try {
    const payload = toBackendOrderBase(patch);
    await api.put(`/orders/${id}`, payload);
    return getShipment(id);
  } catch (err) {
    logMockFallback(`No se pudo actualizar la encomienda ${id}`, err);
    return mockApi.updateShipment(id, patch);
  }
}

export async function deleteShipment(id: string): Promise<void> {
  if (USE_MOCK_SHIPMENTS) {
    await mockApi.deleteShipment(id);
    return;
  }

  try {
    await api.delete(`/orders/${id}`);
  } catch (err) {
    logMockFallback(`No se pudo eliminar la encomienda ${id}`, err);
    await mockApi.deleteShipment(id);
  }
}
