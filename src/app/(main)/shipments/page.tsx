'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ShipmentForm } from '@/components/shipments/ShipmentForm';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useClients } from '@/hooks/useClients';
import { useShipments } from '@/hooks/useShipments';
import type { Shipment } from '@/app/lib/types';

type ShipmentInput = Omit<Shipment, 'id' | 'createdAt' | 'updatedAt'>;

export default function ShipmentsPage() {
  const { data, loading, create, update, remove } = useShipments();
  const { data: clients } = useClients();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shipment | null>(null);
  const clientNames = new Map(clients.map((client) => [client.id, client.name]));

  const openCreate = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (shipment: Shipment) => {
    setEditing(shipment);
    setOpen(true);
  };

  const closeModal = () => {
    setEditing(null);
    setOpen(false);
  };

  const handleSubmit = async (values: ShipmentInput) => {
    if (editing) {
      await update(editing.id, values);
    } else {
      await create(values);
    }

    closeModal();
  };

  const handleDelete = async (shipment: Shipment) => {
    if (!confirm(`Eliminar la encomienda ${shipment.code}?`)) {
      return;
    }

    await remove(shipment.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Encomiendas</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          Crear encomienda
        </button>
      </div>

      {loading ? (
        <div className="card p-4">Cargando...</div>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Codigo</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Origen</th>
                <th className="p-3">Destino</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((shipment) => (
                <tr key={shipment.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{shipment.code}</td>
                  <td className="p-3">{clientNames.get(shipment.clientId) ?? shipment.clientId}</td>
                  <td className="p-3">{shipment.origin}</td>
                  <td className="p-3">{shipment.destination}</td>
                  <td className="p-3">
                    <StatusBadge status={shipment.status} />
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/shipments/${shipment.id}`} className="btn btn-sm">
                      Ver
                    </Link>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => openEdit(shipment)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(shipment)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 p-6">
                    No hay encomiendas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={open}
        onClose={closeModal}
        title={editing ? 'Editar encomienda' : 'Nueva encomienda'}
      >
        <ShipmentForm
          initialData={editing}
          onCancel={closeModal}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
