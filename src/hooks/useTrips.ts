'use client';

import { useEffect, useState } from 'react';
import * as tripsData from '@/app/lib/data/trips';
import type { RouteStop, Trip } from '@/app/lib/types';
import { notify } from '@/app/lib/notify';

const sortStops = (stops: RouteStop[]) =>
  [...stops].sort((left, right) => left.sequence - right.sequence);

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshTrips = async () => {
    setLoading(true);
    try {
      const result = await tripsData.listTrips();
      setTrips(result);
    } catch {
      notify.error('Error al cargar los viajes');
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (input: Omit<Trip, 'id'>) => {
    try {
      const newTrip = await tripsData.createTrip(input);
      setTrips((prev) => [newTrip, ...prev]);
      notify.success('Viaje creado');
      return newTrip;
    } catch {
      notify.error('Error al crear el viaje');
      throw new Error('No se pudo crear el viaje');
    }
  };

  const updateTrip = async (id: string, patch: Partial<Trip>) => {
    try {
      const updated = await tripsData.updateTrip(id, patch);
      setTrips((prev) => prev.map((trip) => (trip.id === id ? updated : trip)));
      notify.success('Viaje actualizado');
      return updated;
    } catch {
      notify.error('Error al actualizar el viaje');
      throw new Error('No se pudo actualizar el viaje');
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      await tripsData.deleteTrip(id);
      setTrips((prev) => prev.filter((trip) => trip.id !== id));
      notify.success('Viaje eliminado');
    } catch {
      notify.error('Error al eliminar el viaje');
      throw new Error('No se pudo eliminar el viaje');
    }
  };

  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true);
      try {
        const result = await tripsData.listTrips();
        setTrips(result);
      } catch {
        notify.error('Error al cargar los viajes');
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  return {
    trips,
    loading,
    refreshTrips,
    createTrip,
    updateTrip,
    deleteTrip,
  };
}

export function useRouteStops(tripId: string) {
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshStops = async () => {
    setLoading(true);
    try {
      const result = await tripsData.listRouteStopsByTrip(tripId);
      setStops(result);
    } catch {
      notify.error('Error al cargar las paradas');
    } finally {
      setLoading(false);
    }
  };

  const addStop = async (input: Omit<RouteStop, 'id'>) => {
    try {
      const newStop = await tripsData.addRouteStop(input);
      setStops((prev) => sortStops([...prev, newStop]));
      notify.success('Parada agregada');
      return newStop;
    } catch {
      notify.error('Error al agregar la parada');
      throw new Error('No se pudo agregar la parada');
    }
  };

  const updateStop = async (id: string, patch: Partial<RouteStop>) => {
    try {
      const updated = await tripsData.updateRouteStop(id, patch);
      setStops((prev) =>
        sortStops(prev.map((stop) => (stop.id === id ? updated : stop)))
      );
      notify.success('Parada actualizada');
      return updated;
    } catch {
      notify.error('Error al actualizar la parada');
      throw new Error('No se pudo actualizar la parada');
    }
  };

  const deleteStop = async (id: string) => {
    try {
      await tripsData.deleteRouteStop(id);
      setStops((prev) => prev.filter((stop) => stop.id !== id));
      notify.success('Parada eliminada');
    } catch {
      notify.error('Error al eliminar la parada');
      throw new Error('No se pudo eliminar la parada');
    }
  };

  useEffect(() => {
    const loadStops = async () => {
      setLoading(true);
      try {
        const result = await tripsData.listRouteStopsByTrip(tripId);
        setStops(result);
      } catch {
        notify.error('Error al cargar las paradas');
      } finally {
        setLoading(false);
      }
    };

    loadStops();
  }, [tripId]);

  return {
    stops,
    loading,
    refreshStops,
    addStop,
    updateStop,
    deleteStop,
  };
}
