// src/components/ui/EmptyState.tsx
export function EmptyState({ title, description, action }: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-8 text-center space-y-2">
      <div className="text-lg font-medium">{title}</div>
      {description && <div className="text-sm text-gray-600">{description}</div>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
