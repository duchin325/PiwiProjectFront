import type { ShipmentStatus } from '../../app/lib/types';
import { shipmentStatusLabels } from '@/app/lib/labels';

export function StatusBadge({ status }: { status: ShipmentStatus }) {
  const map: Record<ShipmentStatus, string> = {
    active:    'bg-blue-100 text-blue-700',
    pending:   'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-700'
  };
  return <span className={`px-2 py-1 rounded-lg text-xs font-medium ${map[status]}`}>
            {shipmentStatusLabels[status]}
        </span>;
}
