// src/app/(main)/clients/page.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { ClientCard } from '@/components/clients/ClientCard';
import { ClientForm } from '@/components/clients/ClientForm';
import { Modal } from '@/components/ui/Modal';
import { notify } from '@/app/lib/notify';
import { Client } from '@/app/lib/types';

export default function ClientsPage() {
  const { data, loading, create, update, remove } = useClients();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const openCreate = () => { setEditing(null); setOpen(true); };
  const openEdit = (client: Client) => { setEditing(client); setOpen(true); };
  const close = () => setOpen(false);

  const handleSubmit = async (values: Omit<Client, 'id'>) => {
    if (editing) {
      await update(editing.id, values);
      notify.success(`Cliente ${values.name} actualizado.`);
    } else {
      await create(values);
      notify.success(`Cliente ${values.name} creado.`);
    }
    setOpen(false);
    setEditing(null);
  };


    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <button className="btn btn-primary" onClick={openCreate}>Crear cliente</button>
      </div>

      {loading ? (
        <div className="card p-4">Cargando…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((c) => (
            <div key={c.id} className="space-y-2">
              <ClientCard c={c} />
              <div className="flex items-center gap-2">
                <Link href={`/clients/${c.id}`} className="btn btn-sm">Ver</Link>
                <button className="btn btn-sm btn-secondary" onClick={() => openEdit(c)}>Editar</button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => {
                    if (confirm(`¿Eliminar a ${c.name}?`)) {
                      remove(c.id);
                      notify.info(`Eliminando a ${c.name}…`);
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          {data.length === 0 && (
            <div className="col-span-full">
              <div className="card p-6 text-center text-gray-600">
                No hay clientes registrados.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal reutilizable */}
      <Modal
        open={open}
        onClose={close}
        title={editing ? 'Editar cliente' : 'Nuevo cliente'}
      >
        <ClientForm
          initialData={editing}
          onCancel={() => { setEditing(null); setOpen(false); }}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
 