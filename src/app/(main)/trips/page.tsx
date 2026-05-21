'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { tripStatusLabels } from '@/app/lib/labels';
import type { Driver, Trip } from '@/app/lib/types';
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

export default function TripsPage() {
  const trips = useTrips();
  const drivers = useDrivers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);

  const driversById = useMemo(
    () =>
      drivers.data.reduce<Record<string, Driver>>((acc, driver) => {
        acc[driver.id] = driver;
        return acc;
      }, {}),
    [drivers.data]
  );

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

      {trips.loading || drivers.loading ? (
        <div className="card p-4">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {trips.trips.map((trip) => (
            <article key={trip.id} className="card p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="font-semibold text-lg">
                    {trip.origin} {'->'} {trip.destination}
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
                  Hoja de ruta
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
