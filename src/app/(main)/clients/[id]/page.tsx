'use client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as clientsData from '@/app/lib/data/clients';
import * as shipmentsData from '@/app/lib/data/shipments';
import type { Client, Shipment } from '@/app/lib/types';

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? '';
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [client, allShipments] = await Promise.all([
          clientsData.getClient(id),
          shipmentsData.listShipments(),
        ]);

        if (cancelled) return;

        setClient(client);
        setShipments(allShipments.filter((shipment) => shipment.clientId === id));
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

  if (loading) return <div className="card p-4">Cargando...</div>;
  if (!client) return <div className="card p-4">Cliente no encontrado</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{client.name}</h1>
        <button className="btn" onClick={() => router.back()}>
          Volver
        </button>
      </div>

      <div className="card p-4 space-y-1">
        <div>Email: {client.email}</div>
        {client.phone && <div>Tel: {client.phone}</div>}
        {client.address && <div>Direccion: {client.address}</div>}
      </div>

      <div className="space-y-2">
        <h2 className="font-medium">Historial de envios</h2>
        <ul className="card divide-y">
          {shipments.length === 0 ? (
            <li className="p-3 text-sm text-gray-600">Sin envios aun.</li>
          ) : (
            shipments.map((shipment) => (
              <li
                key={shipment.id}
                className="p-3 flex items-center justify-between"
              >
                <div>
                  {shipment.code} - {shipment.destination} ({shipment.status})
                </div>
                <Link className="btn" href={`/shipments/${shipment.id}`}>
                  Ver
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
