'use client';
import { useEffect, useState } from 'react';
import { shipmentStatusLabels } from '@/app/lib/labels';
import { useClients } from '@/hooks/useClients';
import type { Shipment } from '@/app/lib/types';

type ShipmentInput = Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>;

type Props = {
  onSubmit: (data: ShipmentInput) => Promise<void>;
  initialData?: Shipment | null;
  onCancel?: () => void;
};

const emptyForm: ShipmentInput = {
  code: '',
  clientId: '',
  origin: '',
  destination: '',
  status: 'pending',
};

const toFormValues = (shipment?: Shipment | null): ShipmentInput =>
  shipment
    ? {
        code: shipment.code,
        clientId: shipment.clientId,
        origin: shipment.origin,
        destination: shipment.destination,
        status: shipment.status,
      }
    : emptyForm;

export function ShipmentForm({ onSubmit, initialData, onCancel }: Props) {
  const [form, setForm] = useState<ShipmentInput>(toFormValues(initialData));
  const { data: clients, loading: loadingClients } = useClients();

  useEffect(() => {
    setForm(toFormValues(initialData));
  }, [initialData]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="label">Codigo</label>
          <input
            name="code"
            className="input"
            value={form.code}
            onChange={handleChange}
            placeholder="Se genera automaticamente al guardar"
            disabled
          />
        </div>

        <div>
          <label className="label">Cliente</label>
          <select
            name="clientId"
            className="input"
            value={form.clientId}
            onChange={handleChange}
            disabled={loadingClients}
          >
            <option value="">
              {loadingClients ? 'Cargando clientes...' : 'Seleccione...'}
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Origen</label>
          <input
            name="origin"
            className="input"
            value={form.origin}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label">Destino</label>
          <input
            name="destination"
            className="input"
            value={form.destination}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="label">Estado</label>
          <select
            name="status"
            className="input"
            value={form.status}
            onChange={handleChange}
          >
            <option value="pending">{shipmentStatusLabels.pending}</option>
            <option value="active">{shipmentStatusLabels.active}</option>
            <option value="completed">{shipmentStatusLabels.completed}</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Guardar' : 'Crear'}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
