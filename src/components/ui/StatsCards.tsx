export function StatsCards({ active, pending, completed }: { active:number; pending:number; completed:number }) {
  const Box = ({ label, value }: { label: string; value: number }) => (
    <div className="card p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Box label="Activas" value={active} />
      <Box label="Pendientes" value={pending} />
      <Box label="Completadas" value={completed} />
    </div>
  );
}
