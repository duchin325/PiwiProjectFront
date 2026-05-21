import type { RouteStopType, ShipmentStatus, tripStatus } from '@/app/lib/types';

export const shipmentStatusLabels: Record<ShipmentStatus, string> = {
  pending: 'Pendiente',
  active: 'En transito',
  completed: 'Entregado',
};

export const tripStatusLabels: Record<tripStatus, string> = {
  scheduled: 'Planificado',
  in_transit: 'En curso',
  delivered: 'Finalizado',
  canceled: 'Cancelado',
};

export const routeStopTypeLabels: Record<RouteStopType, string> = {
  pickup: 'Retiro',
  delivery: 'Entrega',
  checkpoint: 'Control',
  other: 'Otro',
};
