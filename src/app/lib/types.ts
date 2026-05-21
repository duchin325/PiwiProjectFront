export type Role = 'admin' | 'operator';


export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    password: string; // solo para mockApi
}

export type ShipmentStatus = 'active' | 'pending' | 'completed';

export interface Shipment {
  id: string;
  code: string;       // tracking code
  clientId: string;
  origin: string;
  destination: string;
  originAddress?: string;
  destinationAddress?: string;
  senderName?: string;
  senderPhone?: string;
  recipientName?: string;
  recipientPhone?: string;
  amountToCollect?: number;
  notes?: string;
  status: ShipmentStatus;
  createdAt: string;  // ISO
  updatedAt: string;  // ISO
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone?: string;
  truckPlate?: string;
  notes?: string;
}

export type tripStatus = 'scheduled' | 'in_transit' | 'delivered' | 'canceled';

export interface Trip {
  id: string;
  date: string;
  driverId: string;
  origin: string;
  destination: string;
  status: tripStatus;
  notes?: string
}

export type RouteStopType = 'pickup' | 'delivery' | 'checkpoint' | 'other';

export interface RouteStop {
  id: string;
  tripId: string;
  orderId?: string;
  sequence: number;
  name: string;
  stopType: RouteStopType;
  city: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  scheduledTime?: string;
  notes?: string;
  cashOnDelivery: boolean;
  cashAmount?: number;
  completed: boolean;
}
