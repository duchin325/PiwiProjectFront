'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import * as driversData from '@/app/lib/data/drivers';
import * as tripsData from '@/app/lib/data/trips';
import { tripStatusLabels } from '@/app/lib/labels';
import type { Driver, Trip, tripStatus } from '@/app/lib/types';

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

export default function DriverDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [driverResult, allTrips] = await Promise.all([
          driversData.getDriver(id),
          tripsData.listTrips(),
        ]);

        if (cancelled) return;

        setDriver(driverResult);
        setTrips(allTrips.filter((trip) => trip.driverId === id));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const statusCounts = useMemo(
    () =>
      trips.reduce(
        (acc, trip) => {
          acc[trip.status] += 1;
          return acc;
        },
        { ...emptyStatusCounts }
      ),
    [trips]
  );

  if (loading) return <div className="card p-4">Cargando...</div>;
  if (!driver) return <div className="card p-4">Conductor no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{driver.name}</h1>
          <p className="text-sm text-gray-600">Licencia: {driver.licenseNumber}</p>
        </div>
        <Link href="/drivers" className="btn">
          Volver
        </Link>
      </div>

      <div className="card p-4 space-y-2">
        <div>
          <span className="label">Nombre:</span> <span className="font-medium">{driver.name}</span>
        </div>
        {driver.phone && (
          <div>
            <span className="label">Telefono:</span> {driver.phone}
          </div>
        )}
        <div>
          <span className="label">Licencia:</span> {driver.licenseNumber}
        </div>
        {driver.truckPlate && (
          <div>
            <span className="label">Patente:</span> {driver.truckPlate}
          </div>
        )}
        {driver.notes && (
          <div>
            <span className="label">Notas:</span> {driver.notes}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="card p-4">
          <div className="text-xs text-gray-500">Total de viajes</div>
          <div className="text-2xl font-semibold">{trips.length}</div>
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

      <div className="space-y-2">
        <h2 className="font-medium">Viajes asignados</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Origen</th>
                <th className="p-3">Destino</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{trip.origin}</td>
                  <td className="p-3">{trip.destination}</td>
                  <td className="p-3">{new Date(trip.date).toLocaleString()}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${tripStatusStyles[trip.status]}`}
                    >
                      {tripStatusLabels[trip.status]}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/trips/${trip.id}`} className="btn btn-sm">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
              {trips.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 p-6">
                    Este conductor no tiene viajes asignados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
