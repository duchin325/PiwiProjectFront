'use client';
import { useEffect, useState } from 'react';
import type { Client } from '@/app/lib/types';

type Props = {
  onSubmit: (data: Omit<Client, 'id'>) => Promise<void>;
  initialData?: Client | null;
  onCancel?: () => void;
};

const emptyForm: Omit<Client, 'id'> = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

const toFormValues = (client?: Client | null): Omit<Client, 'id'> =>
  client
    ? {
        name: client.name,
        email: client.email,
        phone: client.phone ?? '',
        address: client.address ?? '',
      }
    : emptyForm;

export function ClientForm({ onSubmit, initialData, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Client, 'id'>>(toFormValues(initialData));

  useEffect(() => {
    setForm(toFormValues(initialData));
  }, [initialData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-sm border rounded-xl p-4 space-y-3 max-w-md"
    >
      <h2 className="text-lg font-semibold">
        {initialData ? 'Editar cliente' : 'Nuevo cliente'}
      </h2>

      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="input"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Telefono</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Direccion</label>
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Guardar cambios' : 'Crear cliente'}
        </button>
      </div>
    </form>
  );
}
