'use client';
import Link from 'next/link';
import { useShipments } from '@/hooks/useShipments';
import { StatsCards } from '@/components/ui/StatsCards';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Table } from '@/components/ui/Table';

export default function DashboardPage() {
  const { data, loading } = useShipments();

  const active    = data.filter(s => s.status === 'active').length;
  const pending   = data.filter(s => s.status === 'pending').length;
  const completed = data.filter(s => s.status === 'completed').length;

  const headers = ['Código', 'Cliente', 'Origen', 'Destino', 'Estado', 'Acciones'];
  const rows = data.slice(0, 8).map(s => [
    <span key={`code-${s.id}`} className="font-medium">{s.code}</span>,
    s.clientId,
    s.origin,
    s.destination,
    <StatusBadge key={`st-${s.id}`} status={s.status} />,
    <Link key={`view-${s.id}`} href={`/shipments/${s.id}`} className="btn">Ver</Link>,
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {loading ? (
        <div className="card p-4">Cargando…</div>
      ) : (
        <>
          <StatsCards active={active} pending={pending} completed={completed} />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Últimas encomiendas</h2>
              <Link href="/shipments" className="btn">Ver todas</Link>
            </div>
            <Table headers={headers} rows={rows} />
          </div>
        </>
      )}
    </div>
  );
}
