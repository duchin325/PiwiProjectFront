import Link from 'next/link';
import { notFound } from 'next/navigation';
import * as clientsData from '@/app/lib/data/clients';
import * as shipmentsData from '@/app/lib/data/shipments';
import { StatusBadge } from '@/components/ui/StatusBadge';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ShipmentDetailPage({ params }: Props) {
  const { id } = await params;
  const shipment = await shipmentsData.getShipment(id).catch(() => null);

  if (!shipment) {
    notFound();
  }

  const client = await clientsData.getClient(shipment.clientId).catch(() => null);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Encomienda {shipment.code}</h1>
        <Link href="/shipments" className="btn">
          Volver
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4 space-y-2">
          <div>
            <span className="label">Codigo:</span>{' '}
            <span className="font-medium">{shipment.code}</span>
          </div>
          <div>
            <span className="label">Cliente:</span> {client?.name ?? shipment.clientId}
          </div>
          <div>
            <span className="label">Origen:</span> {shipment.origin}
          </div>
          <div>
            <span className="label">Destino:</span> {shipment.destination}
          </div>
          <div className="flex items-center gap-2">
            <span className="label">Estado:</span>
            <StatusBadge status={shipment.status} />
          </div>
        </div>

        <div className="card p-4 space-y-2">
          <div>
            <span className="label">Creado:</span>{' '}
            {new Date(shipment.createdAt).toLocaleString()}
          </div>
          <div>
            <span className="label">Actualizado:</span>{' '}
            {new Date(shipment.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
