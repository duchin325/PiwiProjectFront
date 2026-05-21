'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import * as driversData from '@/app/lib/data/drivers';
import * as shipmentsData from '@/app/lib/data/shipments';
import * as tripsData from '@/app/lib/data/trips';
import { routeStopTypeLabels, tripStatusLabels } from '@/app/lib/labels';
import { notify } from '@/app/lib/notify';
import type { Driver, RouteStop, Shipment, Trip } from '@/app/lib/types';
import { useRouteStops } from '@/hooks/useTrips';

type StopForm = Omit<RouteStop, 'id' | 'tripId'>;

const buildEmptyStopForm = (sequence = 1): StopForm => ({
  orderId: '',
  sequence,
  name: '',
  stopType: 'pickup',
  city: '',
  address: '',
  contactName: '',
  contactPhone: '',
  scheduledTime: '',
  notes: '',
  cashOnDelivery: false,
  cashAmount: undefined,
  completed: false,
});

const stopTypeStyles: Record<RouteStop['stopType'], string> = {
  pickup: 'bg-amber-100 text-amber-800',
  delivery: 'bg-emerald-100 text-emerald-800',
  checkpoint: 'bg-sky-100 text-sky-800',
  other: 'bg-slate-100 text-slate-700',
};

const formatDateTime = (value: string) => new Date(value).toLocaleString();

const formatCurrency = (value?: number) =>
  typeof value === 'number'
    ? new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 2,
      }).format(value)
    : 'A definir';

const buildStopSuggestion = (shipment: Shipment, stopType: RouteStop['stopType']): Partial<StopForm> => {
  const isPickup = stopType === 'pickup';
  const city = isPickup ? shipment.origin : shipment.destination;
  const address = isPickup ? shipment.originAddress : shipment.destinationAddress;
  const contactName = isPickup ? shipment.senderName : shipment.recipientName;
  const contactPhone = isPickup ? shipment.senderPhone : shipment.recipientPhone;
  const fallbackName = isPickup
    ? `Retiro ${shipment.code}`
    : stopType === 'delivery'
      ? `Entrega ${shipment.code}`
      : `${routeStopTypeLabels[stopType]} ${shipment.code}`;

  return {
    name: contactName || fallbackName,
    city: city || '',
    address: address || '',
    contactName: contactName || '',
    contactPhone: contactPhone || '',
    cashOnDelivery: stopType === 'delivery' ? (shipment.amountToCollect ?? 0) > 0 : false,
    cashAmount:
      stopType === 'delivery' && (shipment.amountToCollect ?? 0) > 0
        ? shipment.amountToCollect
        : undefined,
    notes: shipment.notes || '',
  };
};

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const tripId = params?.id ?? '';
  const { stops, loading: stopsLoading, addStop, updateStop, deleteStop } = useRouteStops(tripId);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [form, setForm] = useState<StopForm>(buildEmptyStopForm());

  const shipmentsById = useMemo(
    () =>
      shipments.reduce<Record<string, Shipment>>((acc, shipment) => {
        acc[shipment.id] = shipment;
        return acc;
      }, {}),
    [shipments]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const tripData = await tripsData.getTrip(tripId);
        const [drivers, shipmentsDataResult] = await Promise.all([
          driversData.listDrivers(),
          shipmentsData.listShipments(),
        ]);

        if (cancelled) return;

        setTrip(tripData);
        setDriver(drivers.find((item) => item.id === tripData.driverId) ?? null);
        setShipments(shipmentsDataResult);
      } catch {
        notify.error('No se pudo cargar el viaje');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (tripId) {
      load();
    } else {
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [tripId]);

  useEffect(() => {
    if (!editingStopId) {
      setForm(buildEmptyStopForm(stops.length + 1));
    }
  }, [editingStopId, stops.length]);

  const resetForm = () => {
    setForm(buildEmptyStopForm(stops.length + 1));
    setEditingStopId(null);
  };

  const applyShipmentSuggestion = (
    shipmentId: string | undefined,
    stopType: RouteStop['stopType'],
    overrides: Partial<StopForm> = {}
  ) => {
    if (!shipmentId) {
      setForm((prev) => ({ ...prev, ...overrides }));
      return;
    }

    const shipment = shipmentsById[shipmentId];
    if (!shipment) {
      setForm((prev) => ({ ...prev, ...overrides }));
      return;
    }

    const suggestion = buildStopSuggestion(shipment, stopType);
    setForm((prev) => ({
      ...prev,
      ...suggestion,
      ...overrides,
    }));
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;
    let nextValue: string | number | boolean | undefined = value;

    if (type === 'checkbox') {
      nextValue = (event.target as HTMLInputElement).checked;
    }

    if (type === 'number') {
      nextValue = value === '' ? undefined : Number(value);
    }

    if (name === 'orderId') {
      applyShipmentSuggestion(
        String(nextValue || ''),
        form.stopType,
        { orderId: String(nextValue || '') }
      );
      return;
    }

    if (name === 'stopType') {
      applyShipmentSuggestion(
        form.orderId,
        value as RouteStop['stopType'],
        { stopType: value as RouteStop['stopType'] }
      );
      return;
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: Omit<RouteStop, 'id'> = {
      ...form,
      tripId,
      orderId: form.orderId || undefined,
      address: form.address || '',
      contactName: form.contactName || '',
      contactPhone: form.contactPhone || '',
      scheduledTime: form.scheduledTime || '',
      notes: form.notes || '',
      cashAmount: form.cashOnDelivery ? form.cashAmount : undefined,
    };

    if (editingStopId) {
      await updateStop(editingStopId, payload);
    } else {
      await addStop(payload);
    }

    resetForm();
  };

  const handleEdit = (stop: RouteStop) => {
    setEditingStopId(stop.id);
    setForm({
      orderId: stop.orderId ?? '',
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
      cashAmount: stop.cashAmount,
      completed: stop.completed,
    });
  };

  const handleDelete = async (stop: RouteStop) => {
    if (!confirm(`Eliminar la parada ${stop.sequence} - ${stop.name}?`)) {
      return;
    }

    await deleteStop(stop.id);

    if (editingStopId === stop.id) {
      resetForm();
    }
  };

  const moveStop = async (stop: RouteStop, direction: 'up' | 'down') => {
    const currentIndex = stops.findIndex((item) => item.id === stop.id);
    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const otherStop = stops[swapIndex];

    if (!otherStop) {
      return;
    }

    const tempSequence = Math.max(...stops.map((item) => item.sequence)) + 1;
    await updateStop(stop.id, { sequence: tempSequence });
    await updateStop(otherStop.id, { sequence: stop.sequence });
    await updateStop(stop.id, { sequence: otherStop.sequence });
  };

  if (loading) return <div className="card p-4">Cargando...</div>;
  if (!trip) return <div className="card p-4">Viaje no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="print-sheet space-y-6">
        <section className="border border-slate-300 rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Piwi Encomiendas</p>
              <h1 className="text-3xl font-semibold">Hoja de ruta</h1>
              <p className="text-base text-slate-700">
                {trip.origin} {'->'} {trip.destination}
              </p>
            </div>
            <div className="text-sm text-right text-slate-600 space-y-1">
              <p>Fecha: {formatDateTime(trip.date)}</p>
              <p>Conductor: {driver?.name || 'Sin asignar'}</p>
              <p>Estado: {tripStatusLabels[trip.status]}</p>
              <p>Total de paradas: {stops.length}</p>
            </div>
          </div>

          {trip.notes && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
              <p className="text-sm font-medium text-slate-800">Observaciones generales</p>
              <p className="text-sm text-slate-700 mt-1">{trip.notes}</p>
            </div>
          )}

          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left">
                <th className="border border-slate-300 px-3 py-2 w-12">#</th>
                <th className="border border-slate-300 px-3 py-2">Parada</th>
                <th className="border border-slate-300 px-3 py-2">Tipo</th>
                <th className="border border-slate-300 px-3 py-2">Ciudad / Direccion</th>
                <th className="border border-slate-300 px-3 py-2">Encomienda</th>
                <th className="border border-slate-300 px-3 py-2">Hora</th>
                <th className="border border-slate-300 px-3 py-2">Cobro</th>
                <th className="border border-slate-300 px-3 py-2">Notas</th>
              </tr>
            </thead>
            <tbody>
              {stops.map((stop) => (
                <tr key={stop.id} className="align-top">
                  <td className="border border-slate-300 px-3 py-2 font-semibold">{stop.sequence}</td>
                  <td className="border border-slate-300 px-3 py-2">
                    <div className="font-medium">{stop.name}</div>
                    {stop.contactName && (
                      <div className="text-slate-600">
                        {stop.contactName}
                        {stop.contactPhone ? ` - ${stop.contactPhone}` : ''}
                      </div>
                    )}
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    {routeStopTypeLabels[stop.stopType]}
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    <div>{stop.city}</div>
                    {stop.address && <div className="text-slate-600">{stop.address}</div>}
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    {stop.orderId
                      ? shipmentsById[stop.orderId]?.code || stop.orderId
                      : 'Sin vincular'}
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    {stop.scheduledTime || '-'}
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    {stop.cashOnDelivery ? formatCurrency(stop.cashAmount) : 'No'}
                  </td>
                  <td className="border border-slate-300 px-3 py-2">
                    {stop.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="grid grid-cols-2 gap-8 pt-8 text-sm text-slate-700">
            <div className="border-t border-slate-400 pt-2">Firma chofer</div>
            <div className="border-t border-slate-400 pt-2">Recepcion / control</div>
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-xl font-semibold">
            Hoja de ruta: {trip.origin} {'->'} {trip.destination}
          </h1>
          <p className="text-sm text-gray-600">
            {new Date(trip.date).toLocaleString()} - {driver?.name || 'Sin conductor'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary" onClick={() => window.print()}>
            Imprimir hoja de ruta
          </button>
          <Link href="/trips" className="btn">
            Volver
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 no-print">
        <section className="card p-5 space-y-4">
          <div>
            <h2 className="font-semibold">Resumen de la hoja</h2>
            <p className="text-sm text-gray-600">
              Estado: {tripStatusLabels[trip.status]} - Conductor: {driver?.name || 'No asignado'}
            </p>
          </div>

          {trip.notes && <p className="text-sm text-gray-700">{trip.notes}</p>}

          <div className="space-y-3">
            <h3 className="font-medium">Paradas de ruta</h3>
            {stopsLoading ? (
              <div className="text-sm text-gray-500">Cargando paradas...</div>
            ) : stops.length === 0 ? (
              <div className="text-sm text-gray-500">
                Todavia no hay paradas para este viaje.
              </div>
            ) : (
              <div className="space-y-3">
                {stops.map((stop) => (
                  <article key={stop.id} className="border rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold rounded-full bg-slate-900 text-white px-2 py-1">
                            #{stop.sequence}
                          </span>
                          <h4 className="font-medium">{stop.name}</h4>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-medium ${stopTypeStyles[stop.stopType]}`}
                          >
                            {routeStopTypeLabels[stop.stopType]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {stop.city}
                          {stop.address ? ` - ${stop.address}` : ''}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs">
                        {stop.cashOnDelivery ? 'Cobro en parada' : 'Sin cobro'}
                      </span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
                      <p>
                        Encomienda:{' '}
                        {stop.orderId
                          ? shipmentsById[stop.orderId]?.code || stop.orderId
                          : 'Sin vincular'}
                      </p>
                      <p>Estado: {stop.completed ? 'Completada' : 'Pendiente'}</p>
                      {stop.scheduledTime && <p>Hora: {stop.scheduledTime}</p>}
                      {stop.contactName && <p>Contacto: {stop.contactName}</p>}
                      {stop.contactPhone && <p>Telefono: {stop.contactPhone}</p>}
                      {stop.cashOnDelivery && (
                        <p>
                          Importe a cobrar:{' '}
                          {typeof stop.cashAmount === 'number' ? `$${stop.cashAmount}` : 'A definir'}
                        </p>
                      )}
                    </div>

                    {stop.notes && <p className="text-sm text-gray-700">{stop.notes}</p>}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn"
                        onClick={() => moveStop(stop, 'up')}
                        disabled={stops[0]?.id === stop.id}
                      >
                        Subir
                      </button>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => moveStop(stop, 'down')}
                        disabled={stops[stops.length - 1]?.id === stop.id}
                      >
                        Bajar
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => handleEdit(stop)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-error"
                        onClick={() => handleDelete(stop)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="card p-5 space-y-4">
          <div>
            <h2 className="font-semibold">
              {editingStopId ? 'Editar parada' : 'Nueva parada'}
            </h2>
            <p className="text-sm text-gray-600">
              Agrega retiros, entregas o controles intermedios para este viaje.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Orden</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  name="sequence"
                  value={form.sequence}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Tipo de parada</label>
                <select
                  className="input"
                  name="stopType"
                  value={form.stopType}
                  onChange={handleChange}
                >
                  {Object.entries(routeStopTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Encomienda</label>
              <div className="space-y-2">
                <select
                  className="input"
                  name="orderId"
                  value={form.orderId ?? ''}
                  onChange={handleChange}
                >
                  <option value="">Sin encomienda vinculada</option>
                  {shipments.map((shipment) => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.code} - {shipment.origin} {'->'} {shipment.destination}
                    </option>
                  ))}
                </select>

                {form.orderId && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => applyShipmentSuggestion(form.orderId, form.stopType)}
                  >
                    Autocompletar desde encomienda
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="label">Nombre de parada</label>
              <input
                className="input"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Ciudad</label>
                <input
                  className="input"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="label">Hora prevista</label>
                <input
                  className="input"
                  name="scheduledTime"
                  value={form.scheduledTime ?? ''}
                  onChange={handleChange}
                  placeholder="09:30"
                />
              </div>
            </div>

            <div>
              <label className="label">Direccion</label>
              <input
                className="input"
                name="address"
                value={form.address ?? ''}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Contacto</label>
                <input
                  className="input"
                  name="contactName"
                  value={form.contactName ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Telefono</label>
                <input
                  className="input"
                  name="contactPhone"
                  value={form.contactPhone ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="label">Notas</label>
              <textarea
                className="input min-h-24"
                name="notes"
                value={form.notes ?? ''}
                onChange={handleChange}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="cashOnDelivery"
                checked={form.cashOnDelivery}
                onChange={handleChange}
              />
              Requiere cobro en esta parada
            </label>

            {form.cashOnDelivery && (
              <div>
                <label className="label">Importe a cobrar</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  name="cashAmount"
                  value={form.cashAmount ?? ''}
                  onChange={handleChange}
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="completed"
                checked={form.completed}
                onChange={handleChange}
              />
              Marcar como completada
            </label>

            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingStopId ? 'Guardar cambios' : 'Agregar parada'}
              </button>
              {editingStopId && (
                <button type="button" className="btn" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
