// src/components/clients/ClientCard.tsx
import type { Client } from '@/app/lib/types';

export function ClientCard({ c }: { c: Client }) {
  return (
    <div className="card p-4">
      <div className="font-medium">{c.name}</div>
      <div className="text-sm text-gray-600">{c.email}</div>
      {c.phone && <div className="text-sm text-gray-600">{c.phone}</div>}
      {c.address && <div className="text-sm text-gray-600">{c.address}</div>}
    </div>
  );
}
