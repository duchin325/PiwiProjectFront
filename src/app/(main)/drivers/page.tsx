'use client';
import Link from 'next/link';
import { useState } from 'react';
import type { Driver } from '@/app/lib/types';
import { DriverForm } from '@/components/drivers/DriverForm';
import { Modal } from '@/components/ui/Modal';
import { useDrivers } from '@/hooks/useDrivers';

export default function DriversPage() {
  const { data, loading, create, update, remove } = useDrivers();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);

  const closeModal = () => {
    setEditing(null);
    setOpen(false);
  };

  const handleSubmit = async (values: Omit<Driver, 'id'>) => {
    if (editing) {
      await update(editing.id, values);
    } else {
      await create(values);
    }

    closeModal();
  };

  const handleDelete = async (driver: Driver) => {
    if (!confirm(`Eliminar al conductor ${driver.name}?`)) {
      return;
    }

    await remove(driver.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Conductores</h1>
          <p className="text-sm text-gray-600">Gestiona choferes, licencias y unidades asignadas.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          Nuevo conductor
        </button>
      </div>

      {loading ? (
        <div className="card p-4">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((driver) => (
            <article key={driver.id} className="card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-lg">
                    <Link href={`/drivers/${driver.id}`} className="hover:underline">
                      {driver.name}
                    </Link>
                  </h2>
                  <p className="text-sm text-gray-600">Licencia: {driver.licenseNumber}</p>
                </div>
                <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                  {driver.truckPlate || 'Sin patente'}
                </span>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p>Telefono: {driver.phone || 'No informado'}</p>
                <p>Notas: {driver.notes || 'Sin notas'}</p>
              </div>

              <div className="flex gap-2">
                <Link href={`/drivers/${driver.id}`} className="btn btn-primary">
                  Ver detalle
                </Link>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditing(driver);
                    setOpen(true);
                  }}
                >
                  Editar
                </button>
                <button className="btn btn-error" onClick={() => handleDelete(driver)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}

          {data.length === 0 && (
            <div className="card p-6 text-center text-gray-600 col-span-full">
              No hay conductores registrados.
            </div>
          )}
        </div>
      )}

      <Modal open={open} onClose={closeModal} title={editing ? 'Editar conductor' : 'Nuevo conductor'}>
        <DriverForm initialData={editing} onCancel={closeModal} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
}
