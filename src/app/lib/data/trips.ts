import { api } from '@/app/lib/axios';
import { mockApi } from '@/app/lib/mockApi';
import { logMockFallback, resolveMockMode } from '@/app/lib/data/source';
import type { RouteStop, Trip, tripStatus } from '@/app/lib/types';

const USE_MOCK_TRIPS = resolveMockMode(process.env.NEXT_PUBLIC_USE_MOCK_TRIPS);

type BackendTrip = {
  id: number;
  date: string;
  driverId: number | null;
  origin: string | null;
  destination: string | null;
  status: tripStatus;
  notes?: string | null;
};

type BackendRouteStop = {
  id: number;
  tripId: number;
  orderId: number | null;
  sequence: number;
  name: string;
  stopType: RouteStop['stopType'];
  city: string;
  address: string | null;
  contactName: string | null;
  contactPhone: string | null;
  scheduledTime: string | null;
  notes: string | null;
  cashOnDelivery: boolean;
  cashAmount: number | null;
  completed: boolean;
  createdAt: string;
};

const normalizeTrip = (trip: BackendTrip): Trip => ({
  id: String(trip.id),
  date: trip.date,
  driverId: trip.driverId ? String(trip.driverId) : '',
  origin: trip.origin ?? '',
  destination: trip.destination ?? '',
  status: trip.status,
  notes: trip.notes ?? '',
});

const normalizeRouteStop = (stop: BackendRouteStop): RouteStop => ({
  id: String(stop.id),
  tripId: String(stop.tripId),
  orderId: stop.orderId ? String(stop.orderId) : '',
  sequence: stop.sequence,
  name: stop.name,
  stopType: stop.stopType,
  city: stop.city,
  address: stop.address ?? '',
  contactName: stop.contactName ?? '',
  contactPhone: stop.contactPhone ?? '',
  scheduledTime: stop.scheduledTime ?? '',
  notes: stop.notes ?? '',
  cashOnDelivery: stop.cashOnDelivery,
  cashAmount: stop.cashAmount ?? undefined,
  completed: stop.completed,
});

const toBackendTrip = (trip: Omit<Trip, 'id'>) => ({
  date: trip.date,
  driverId: trip.driverId ? Number(trip.driverId) : undefined,
  origin: trip.origin,
  destination: trip.destination,
  status: trip.status,
  notes: trip.notes || null,
});

const toBackendRouteStop = (stop: Omit<RouteStop, 'id'> | Partial<RouteStop>) => ({
  ...(stop.tripId !== undefined ? { tripId: Number(stop.tripId) } : {}),
  ...(stop.orderId !== undefined ? { orderId: stop.orderId ? Number(stop.orderId) : null } : {}),
  ...(stop.sequence !== undefined ? { sequence: stop.sequence } : {}),
  ...(stop.name !== undefined ? { name: stop.name } : {}),
  ...(stop.stopType !== undefined ? { stopType: stop.stopType } : {}),
  ...(stop.city !== undefined ? { city: stop.city } : {}),
  ...(stop.address !== undefined ? { address: stop.address || null } : {}),
  ...(stop.contactName !== undefined ? { contactName: stop.contactName || null } : {}),
  ...(stop.contactPhone !== undefined ? { contactPhone: stop.contactPhone || null } : {}),
  ...(stop.scheduledTime !== undefined ? { scheduledTime: stop.scheduledTime || null } : {}),
  ...(stop.notes !== undefined ? { notes: stop.notes || null } : {}),
  ...(stop.cashOnDelivery !== undefined ? { cashOnDelivery: stop.cashOnDelivery } : {}),
  ...(stop.cashAmount !== undefined ? { cashAmount: stop.cashAmount ?? null } : {}),
  ...(stop.completed !== undefined ? { completed: stop.completed } : {}),
});

export async function listTrips(): Promise<Trip[]> {
  if (USE_MOCK_TRIPS) return mockApi.listTrips();
  try {
    const { data } = await api.get<BackendTrip[]>('/trips');
    return data.map(normalizeTrip);
  } catch (err) {
    logMockFallback('Error al obtener viajes', err);
    return mockApi.listTrips();
  }
}

export async function getTrip(id: string): Promise<Trip> {
  if (USE_MOCK_TRIPS) return mockApi.getTrip(id);
  try {
    const { data } = await api.get<BackendTrip>(`/trips/${id}`);
    return normalizeTrip(data);
  } catch (err) {
    logMockFallback(`No se pudo obtener el viaje ${id}`, err);
    return mockApi.getTrip(id);
  }
}

export async function createTrip(data: Omit<Trip, 'id'>): Promise<Trip> {
  if (USE_MOCK_TRIPS) return mockApi.createTrip(data);
  try {
    const payload = toBackendTrip(data);
    const { data: created } = await api.post<{ id: number }>('/trips', payload);
    return getTrip(String(created.id));
  } catch (err) {
    logMockFallback('Error creando viaje', err);
    return mockApi.createTrip(data);
  }
}

export async function updateTrip(id: string, patch: Partial<Trip>): Promise<Trip> {
  if (USE_MOCK_TRIPS) return mockApi.updateTrip(id, patch);
  try {
    const payload = {
      ...(patch.date !== undefined ? { date: patch.date } : {}),
      ...(patch.driverId !== undefined
        ? { driverId: patch.driverId ? Number(patch.driverId) : null }
        : {}),
      ...(patch.origin !== undefined ? { origin: patch.origin } : {}),
      ...(patch.destination !== undefined ? { destination: patch.destination } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes || null } : {}),
    };

    await api.put(`/trips/${id}`, payload);
    return getTrip(id);
  } catch (err) {
    logMockFallback(`No se pudo actualizar el viaje ${id}`, err);
    return mockApi.updateTrip(id, patch);
  }
}

export async function deleteTrip(id: string): Promise<{ ok: true }> {
  if (USE_MOCK_TRIPS) return mockApi.deleteTrip(id);
  await api.delete(`/trips/${id}`);
  return { ok: true };
}

export async function listRouteStops(): Promise<RouteStop[]> {
  if (USE_MOCK_TRIPS) return mockApi.listRouteStops();
  try {
    const { data } = await api.get<BackendRouteStop[]>('/trip-stops');
    return data.map(normalizeRouteStop);
  } catch (err) {
    logMockFallback('Error al obtener paradas', err);
    return mockApi.listRouteStops();
  }
}

export async function listRouteStopsByTrip(tripId: string): Promise<RouteStop[]> {
  if (USE_MOCK_TRIPS) return mockApi.listRouteStopsByTrip(tripId);
  try {
    const { data } = await api.get<BackendRouteStop[]>(`/trip-stops/trip/${tripId}`);
    return data.map(normalizeRouteStop);
  } catch (err) {
    logMockFallback(`No se pudieron obtener las paradas del viaje ${tripId}`, err);
    return mockApi.listRouteStopsByTrip(tripId);
  }
}

export async function getRouteStop(id: string): Promise<RouteStop> {
  if (USE_MOCK_TRIPS) return mockApi.getRouteStop(id);
  try {
    const { data } = await api.get<BackendRouteStop>(`/trip-stops/${id}`);
    return normalizeRouteStop(data);
  } catch (err) {
    logMockFallback(`No se pudo obtener la parada ${id}`, err);
    return mockApi.getRouteStop(id);
  }
}

export async function addRouteStop(input: Omit<RouteStop, 'id'>): Promise<RouteStop> {
  if (USE_MOCK_TRIPS) return mockApi.createRouteStop(input);
  try {
    const payload = toBackendRouteStop(input);
    const { data } = await api.post<{ id: number }>('/trip-stops', payload);
    return getRouteStop(String(data.id));
  } catch (err) {
    logMockFallback('Error creando parada', err);
    return mockApi.createRouteStop(input);
  }
}

export async function updateRouteStop(id: string, patch: Partial<RouteStop>): Promise<RouteStop> {
  if (USE_MOCK_TRIPS) return mockApi.updateRouteStop(id, patch);
  try {
    const payload = toBackendRouteStop(patch);
    await api.put(`/trip-stops/${id}`, payload);
    return getRouteStop(id);
  } catch (err) {
    logMockFallback(`No se pudo actualizar la parada ${id}`, err);
    return mockApi.updateRouteStop(id, patch);
  }
}

export async function deleteRouteStop(id: string): Promise<{ ok: true }> {
  if (USE_MOCK_TRIPS) return mockApi.deleteRouteStop(id);
  await api.delete(`/trip-stops/${id}`);
  return { ok: true };
}
