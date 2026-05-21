'use client';
import { useEffect, useState } from 'react';
import type { Driver } from '@/app/lib/types';

type Props = {
  onSubmit: (data: Omit<Driver, 'id'>) => Promise<void>;
  initialData?: Driver | null;
  onCancel?: () => void;
};

const emptyForm: Omit<Driver, 'id'> = {
  name: '',
  licenseNumber: '',
  phone: '',
  truckPlate: '',
  notes: '',
};

const toFormValues = (driver?: Driver | null): Omit<Driver, 'id'> =>
  driver
    ? {
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        phone: driver.phone ?? '',
        truckPlate: driver.truckPlate ?? '',
        notes: driver.notes ?? '',
      }
    : emptyForm;

export function DriverForm({ onSubmit, initialData, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Driver, 'id'>>(toFormValues(initialData));

  useEffect(() => {
    setForm(toFormValues(initialData));
  }, [initialData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(form);

    if (!initialData) {
      setForm(emptyForm);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="label">Nombre</label>
        <input className="input" name="name" value={form.name} onChange={handleChange} required />
      </div>

      <div>
        <label className="label">Licencia</label>
        <input
          className="input"
          name="licenseNumber"
          value={form.licenseNumber}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="label">Telefono</label>
        <input className="input" name="phone" value={form.phone} onChange={handleChange} />
      </div>

      <div>
        <label className="label">Patente</label>
        <input className="input" name="truckPlate" value={form.truckPlate} onChange={handleChange} />
      </div>

      <div>
        <label className="label">Notas</label>
        <textarea className="input min-h-24" name="notes" value={form.notes} onChange={handleChange} />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Guardar cambios' : 'Crear conductor'}
        </button>
      </div>
    </form>
  );
}
