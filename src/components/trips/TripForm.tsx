'use client';
import { useEffect, useState } from 'react';
import { tripStatusLabels } from '@/app/lib/labels';
import type { Driver, Trip, tripStatus } from '@/app/lib/types';

type TripInput = Omit<Trip, 'id'>;

type Props = {
  drivers: Driver[];
  onSubmit: (data: TripInput) => Promise<void>;
  initialData?: Trip | null;
  onCancel?: () => void;
};

const statusOptions: tripStatus[] = ['scheduled', 'in_transit', 'delivered', 'canceled'];

const buildEmptyForm = (drivers: Driver[]): TripInput => ({
  date: new Date().toISOString().slice(0, 16),
  driverId: drivers[0]?.id ?? '',
  origin: '',
  destination: '',
  status: 'scheduled',
  notes: '',
});

const toDatetimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const fromDatetimeLocal = (value: string) => new Date(value).toISOString();

export function TripForm({ drivers, onSubmit, initialData, onCancel }: Props) {
  const [form, setForm] = useState<TripInput>(buildEmptyForm(drivers));

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        date: toDatetimeLocal(initialData.date),
        notes: initialData.notes ?? '',
      });
      return;
    }

    setForm(buildEmptyForm(drivers));
  }, [drivers, initialData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      ...form,
      date: fromDatetimeLocal(form.date),
    });

    if (!initialData) {
      setForm(buildEmptyForm(drivers));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Fecha y hora</label>
        <input
          type="datetime-local"
          className="input"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="label">Conductor</label>
        <select
          className="input"
          name="driverId"
          value={form.driverId}
          onChange={handleChange}
          required
        >
          <option value="">Seleccione...</option>
          {drivers.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Origen</label>
          <input className="input" name="origin" value={form.origin} onChange={handleChange} required />
        </div>

        <div>
          <label className="label">Destino</label>
          <input
            className="input"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Estado</label>
        <select className="input" name="status" value={form.status} onChange={handleChange}>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {tripStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Notas</label>
        <textarea className="input min-h-24" name="notes" value={form.notes ?? ''} onChange={handleChange} />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={drivers.length === 0}>
          {initialData ? 'Guardar cambios' : 'Crear hoja de ruta'}
        </button>
      </div>
    </form>
  );
}
