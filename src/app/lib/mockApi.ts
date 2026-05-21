import type { Client, Driver, RouteStop, Shipment, ShipmentStatus, Trip, User } from './types';

const users: User[] = [
  { id: 'u1', name: 'Admin', email: 'admin@demo.com', role: 'admin', password: 'adm_123' },
  { id: 'u2', name: 'Operador Demo', email: 'op@demo.com', role: 'operator', password: 'op123' },
];

let clients: Client[] = [
  {
    id: 'c1',
    name: 'Juan Perez',
    email: 'juan@example.com',
    phone: '+54 9 351 555-5555',
    address: 'Cordoba, AR',
  },
  {
    id: 'c2',
    name: 'ACME SA',
    email: 'logistica@acme.com',
    phone: '+54 11 4444-4444',
    address: 'CABA, AR',
  },
];

let shipments: Shipment[] = [
  {
    id: 's1',
    code: 'TRK-001',
    clientId: 'c1',
    origin: 'Cordoba',
    destination: 'Rosario',
    originAddress: 'Av. Colon 123',
    destinationAddress: 'San Lorenzo 456',
    senderName: 'Juan Perez',
    senderPhone: '+54 9 351 555-5555',
    recipientName: 'Deposito Rosario',
    recipientPhone: '+54 9 341 444-4444',
    amountToCollect: 15000,
    notes: 'Entregar en horario comercial',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 's2',
    code: 'TRK-002',
    clientId: 'c2',
    origin: 'CABA',
    destination: 'Mendoza',
    originAddress: 'Av. Corrientes 900',
    destinationAddress: 'San Martin 220',
    senderName: 'ACME SA',
    senderPhone: '+54 11 4444-4444',
    recipientName: 'Sucursal Mendoza',
    recipientPhone: '+54 261 555-5555',
    amountToCollect: 0,
    notes: '',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 's3',
    code: 'TRK-003',
    clientId: 'c1',
    origin: 'Cordoba',
    destination: 'CABA',
    originAddress: 'Bv. San Juan 500',
    destinationAddress: 'Av. Santa Fe 2100',
    senderName: 'Juan Perez',
    senderPhone: '+54 9 351 555-5555',
    recipientName: 'Oficina CABA',
    recipientPhone: '+54 11 4321-8765',
    amountToCollect: 7800,
    notes: 'Avisar antes de llegar',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let drivers: Driver[] = [
  {
    id: 'd1',
    name: 'Carlos Gomez',
    licenseNumber: 'ABC123',
    phone: '+54 9 351 666-6666',
    truckPlate: 'XYZ-789',
    notes: 'Conductor con 5 anos de experiencia',
  },
  {
    id: 'd2',
    name: 'Maria Lopez',
    licenseNumber: 'DEF456',
    phone: '+54 11 5555-5555',
    truckPlate: 'LMN-456',
    notes: 'Especialista en rutas largas',
  },
];

let trips: Trip[] = [
  {
    id: 't1',
    date: new Date().toISOString(),
    driverId: 'd1',
    origin: 'Cordoba',
    destination: 'Rosario',
    status: 'in_transit',
    notes: 'Entrega urgente',
  },
  {
    id: 't2',
    date: new Date().toISOString(),
    driverId: 'd2',
    origin: 'CABA',
    destination: 'Mendoza',
    status: 'scheduled',
    notes: 'Ruta planificada para la proxima semana',
  },
];

let routeStops: RouteStop[] = [
  {
    id: 'rs1',
    tripId: 't1',
    orderId: 's1',
    sequence: 1,
    name: 'Retiro central',
    stopType: 'pickup',
    city: 'Cordoba',
    address: 'Av. Colon 123',
    contactName: 'Juan Perez',
    contactPhone: '+54 9 351 555-5555',
    scheduledTime: '09:30',
    notes: 'Retirar bultos fragiles',
    cashOnDelivery: true,
    cashAmount: 15000,
    completed: false,
  },
  {
    id: 'rs2',
    tripId: 't1',
    orderId: 's1',
    sequence: 2,
    name: 'Entrega Rosario centro',
    stopType: 'delivery',
    city: 'Rosario',
    address: 'San Lorenzo 456',
    contactName: 'Deposito Rosario',
    contactPhone: '+54 9 341 444-4444',
    scheduledTime: '14:00',
    notes: '',
    cashOnDelivery: false,
    completed: false,
  },
];

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const mockApi = {
  async login(email: string, password: string) {
    await wait(400);
    const user = users.find((item) => item.email === email);
    if (!user || user.password !== password) throw new Error('Credenciales invalidas');
    return { token: 'mock-token', user };
  },

  async register(name: string, email: string, role: 'admin' | 'operator', password = 'admin123') {
    await wait(400);
    const exists = users.some((item) => item.email === email);
    if (exists) throw new Error('Email ya registrado');
    const user: User = { id: `u${users.length + 1}`, name, email, role, password };
    users.push(user);
    return { token: 'mock-token', user };
  },

  async listClients(): Promise<Client[]> {
    await wait(200);
    return [...clients];
  },

  async getClient(id: string): Promise<Client> {
    await wait(200);
    const client = clients.find((item) => item.id === id);
    if (!client) throw new Error('Cliente no encontrado');
    return client;
  },

  async createClient(data: Omit<Client, 'id'>): Promise<Client> {
    await wait(200);
    const exists = clients.some((item) => item.email === data.email);
    if (exists) throw new Error('Email de cliente ya registrado');
    const newClient: Client = { ...data, id: `c${clients.length + 1}` };
    clients = [newClient, ...clients];
    return newClient;
  },

  async updateClient(id: string, patch: Partial<Client>): Promise<Client> {
    await wait(250);
    clients = clients.map((item) => (item.id === id ? { ...item, ...patch } : item));
    const updated = clients.find((item) => item.id === id);
    if (!updated) throw new Error('Cliente no encontrado');
    return updated;
  },

  async deleteClient(id: string): Promise<{ ok: true }> {
    await wait(200);
    const before = clients.length;
    clients = clients.filter((item) => item.id !== id);
    if (clients.length === before) throw new Error('Cliente no encontrado');
    return { ok: true };
  },

  async listShipments(): Promise<Shipment[]> {
    await wait(200);
    return [...shipments];
  },

  async createShipment(data: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Shipment> {
    await wait(200);
    const newShipment: Shipment = {
      ...data,
      id: `s${shipments.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    shipments = [newShipment, ...shipments];
    return newShipment;
  },

  async updateShipment(
    id: string,
    data: Partial<Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Shipment> {
    await wait(200);
    shipments = shipments.map((item) =>
      item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
    );
    const updated = shipments.find((item) => item.id === id);
    if (!updated) throw new Error('Encomienda no encontrada');
    return updated;
  },

  async getShipment(id: string): Promise<Shipment> {
    await wait(200);
    const shipment = shipments.find((item) => item.id === id);
    if (!shipment) throw new Error('Encomienda no encontrada');
    return shipment;
  },

  async changeShipmentStatus(id: string, status: ShipmentStatus): Promise<Shipment> {
    await wait(200);
    shipments = shipments.map((item) =>
      item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item
    );
    const updated = shipments.find((item) => item.id === id);
    if (!updated) throw new Error('Encomienda no encontrada');
    return updated;
  },

  async deleteShipment(id: string): Promise<{ ok: true }> {
    await wait(200);
    const before = shipments.length;
    shipments = shipments.filter((item) => item.id !== id);
    if (shipments.length === before) throw new Error('Encomienda no encontrada');
    return { ok: true };
  },

  async listDrivers(): Promise<Driver[]> {
    await wait(200);
    return [...drivers];
  },

  async createDriver(data: Omit<Driver, 'id'>): Promise<Driver> {
    await wait(200);
    const newDriver: Driver = { ...data, id: `d${drivers.length + 1}` };
    drivers = [newDriver, ...drivers];
    return newDriver;
  },

  async updateDriver(id: string, patch: Partial<Driver>): Promise<Driver> {
    await wait(250);
    drivers = drivers.map((item) => (item.id === id ? { ...item, ...patch } : item));
    const updated = drivers.find((item) => item.id === id);
    if (!updated) throw new Error('Conductor no encontrado');
    return updated;
  },

  async deleteDriver(id: string): Promise<{ ok: true }> {
    await wait(200);
    const before = drivers.length;
    drivers = drivers.filter((item) => item.id !== id);
    if (drivers.length === before) throw new Error('Conductor no encontrado');
    return { ok: true };
  },

  async listTrips(): Promise<Trip[]> {
    await wait(200);
    return [...trips];
  },

  async getTrip(id: string): Promise<Trip> {
    await wait(200);
    const trip = trips.find((item) => item.id === id);
    if (!trip) throw new Error('Viaje no encontrado');
    return trip;
  },

  async createTrip(data: Omit<Trip, 'id'>): Promise<Trip> {
    await wait(200);
    const newTrip: Trip = { ...data, id: `t${trips.length + 1}` };
    trips = [newTrip, ...trips];
    return newTrip;
  },

  async updateTrip(id: string, patch: Partial<Trip>): Promise<Trip> {
    await wait(250);
    trips = trips.map((item) => (item.id === id ? { ...item, ...patch } : item));
    const updated = trips.find((item) => item.id === id);
    if (!updated) throw new Error('Viaje no encontrado');
    return updated;
  },

  async deleteTrip(id: string): Promise<{ ok: true }> {
    await wait(200);
    const before = trips.length;
    trips = trips.filter((item) => item.id !== id);
    if (trips.length === before) throw new Error('Viaje no encontrado');
    return { ok: true };
  },

  async listRouteStops(): Promise<RouteStop[]> {
    await wait(200);
    return [...routeStops].sort((a, b) => a.sequence - b.sequence);
  },

  async listRouteStopsByTrip(tripId: string): Promise<RouteStop[]> {
    await wait(200);
    return routeStops
      .filter((item) => item.tripId === tripId)
      .sort((a, b) => a.sequence - b.sequence);
  },

  async getRouteStop(id: string): Promise<RouteStop> {
    await wait(200);
    const stop = routeStops.find((item) => item.id === id);
    if (!stop) throw new Error('Parada de ruta no encontrada');
    return stop;
  },

  async createRouteStop(data: Omit<RouteStop, 'id'>): Promise<RouteStop> {
    await wait(200);
    const newStop: RouteStop = { ...data, id: `rs${routeStops.length + 1}` };
    routeStops = [...routeStops, newStop];
    return newStop;
  },

  async updateRouteStop(id: string, patch: Partial<RouteStop>): Promise<RouteStop> {
    await wait(250);
    routeStops = routeStops.map((item) => (item.id === id ? { ...item, ...patch } : item));
    const updated = routeStops.find((item) => item.id === id);
    if (!updated) throw new Error('Parada de ruta no encontrada');
    return updated;
  },

  async deleteRouteStop(id: string): Promise<{ ok: true }> {
    await wait(200);
    const before = routeStops.length;
    routeStops = routeStops.filter((item) => item.id !== id);
    if (routeStops.length === before) throw new Error('Parada de ruta no encontrada');
    return { ok: true };
  },
};
