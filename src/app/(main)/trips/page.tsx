'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { tripStatusLabels } from '@/app/lib/labels';
import type { Driver, Trip, tripStatus } from '@/app/lib/types';
import { TripForm } from '@/components/trips/TripForm';
import { Modal } from '@/components/ui/Modal';
import { useDrivers } from '@/hooks/useDrivers';
import { useTrips } from '@/hooks/useTrips';

const tripStatusStyles: Record<Trip['status'], string> = {
  scheduled: 'bg-slate-100 text-slate-700',
  in_transit: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
};

const emptyStatusCounts: Record<tripStatus, number> = {
  scheduled: 0,
  in_transit: 0,
  delivered: 0,
  canceled: 0,
};

const matchesText = (value: string, query: string) =>
  value.toLowerCase().includes(query.trim().toLowerCase());

type StatusFilter = tripStatus | 'all';

export default function TripsPage() {
  const trips = useTrips();
  const drivers = useDrivers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);

  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [driverFilter, setDriverFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const driversById = useMemo(
    () =>
      drivers.data.reduce<Record<string, Driver>>((acc, driver) => {
        acc[driver.id] = driver;
        return acc;
      }, {}),
    [drivers.data]
  );

  const statusCounts = useMemo(
    () =>
      trips.trips.reduce(
        (acc, trip) => {
          acc[trip.status] += 1;
          return acc;
        },
        { ...emptyStatusCounts }
      ),
    [trips.trips]
  );

  const hasActiveFilters =
    originFilter.trim() !== '' ||
    destinationFilter.trim() !== '' ||
    driverFilter.trim() !== '' ||
    statusFilter !== 'all';

  const filteredTrips = useMemo(
    () =>
      trips.trips.filter((trip) => {
        if (originFilter.trim() && !matchesText(trip.origin, originFilter)) {
          return false;
        }

        if (destinationFilter.trim() && !matchesText(trip.destination, destinationFilter)) {
          return false;
        }

        if (driverFilter.trim()) {
          const driverName = driversById[trip.driverId]?.name ?? '';
          if (!matchesText(driverName, driverFilter)) {
            return false;
          }
        }

        if (statusFilter !== 'all' && trip.status !== statusFilter) {
          return false;
        }

        return true;
      }),
    [trips.trips, originFilter, destinationFilter, driverFilter, statusFilter, driversById]
  );

  const clearFilters = () => {
    setOriginFilter('');
    setDestinationFilter('');
    setDriverFilter('');
    setStatusFilter('all');
  };

  const closeModal = () => {
    setEditing(null);
    setOpen(false);
  };

  const handleSubmit = async (values: Omit<Trip, 'id'>) => {
    if (editing) {
      await trips.updateTrip(editing.id, values);
    } else {
      await trips.createTrip(values);
    }

    closeModal();
  };

  const handleDelete = async (trip: Trip) => {
    if (!confirm(`Eliminar el viaje ${trip.origin} -> ${trip.destination}?`)) {
      return;
    }

    await trips.deleteTrip(trip.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Hojas de ruta</h1>
          <p className="text-sm text-gray-600">
            Organiza recorridos, asigna conductores y controla cada parada.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nueva hoja de ruta
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-2xl font-semibold">{trips.trips.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">{tripStatusLabels.scheduled}</div>
          <div className="text-2xl font-semibold">{statusCounts.scheduled}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">{tripStatusLabels.in_transit}</div>
          <div className="text-2xl font-semibold">{statusCounts.in_transit}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">{tripStatusLabels.delivered}</div>
          <div className="text-2xl font-semibold">{statusCounts.delivered}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-gray-500">{tripStatusLabels.canceled}</div>
          <div className="text-2xl font-semibold">{statusCounts.canceled}</div>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label">Origen</label>
            <input
              className="input"
              placeholder="Buscar por origen"
              value={originFilter}
              onChange={(event) => setOriginFilter(event.target.value)}
            />
          </div>

          <div>
            <label className="label">Destino</label>
            <input
              className="input"
              placeholder="Buscar por destino"
              value={destinationFilter}
              onChange={(event) => setDestinationFilter(event.target.value)}
            />
          </div>

          <div>
            <label className="label">Conductor</label>
            <input
              className="input"
              placeholder="Buscar por conductor"
              value={driverFilter}
              onChange={(event) => setDriverFilter(event.target.value)}
            />
          </div>

          <div>
            <label className="label">Estado</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="all">Todos</option>
              {Object.entries(tripStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      {trips.loading || drivers.loading ? (
        <div className="card p-4">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <article key={trip.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-semibold text-lg">
                    <Link href={`/trips/${trip.id}`} className="hover:underline">
                      {trip.origin} {'->'} {trip.destination}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-600">
                    {new Date(trip.date).toLocaleString()} -{' '}
                    {driversById[trip.driverId]?.name || 'Sin conductor'}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium ${tripStatusStyles[trip.status]}`}
                >
                  {tripStatusLabels[trip.status]}
                </span>
              </div>

              {trip.notes && <p className="text-sm text-gray-700">{trip.notes}</p>}

              <div className="flex gap-2 flex-wrap">
                <Link href={`/trips/${trip.id}`} className="btn btn-primary">
                  Ver detalle
                </Link>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(trip);
                    setOpen(true);
                  }}
                >
                  Editar
                </button>
                <button className="btn btn-error" onClick={() => handleDelete(trip)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}

          {filteredTrips.length === 0 && trips.trips.length > 0 && (
            <div className="card p-6 text-center text-gray-600">
              No hay hojas de ruta que coincidan con los filtros.
            </div>
          )}

          {trips.trips.length === 0 && (
            <div className="card p-6 text-center text-gray-600">
              No hay hojas de ruta registradas.
            </div>
          )}
        </div>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title={editing ? 'Editar hoja de ruta' : 'Nueva hoja de ruta'}
      >
        <TripForm
          drivers={drivers.data}
          initialData={editing}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
