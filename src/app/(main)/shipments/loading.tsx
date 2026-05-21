// src/app/(main)/shipments/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';
export default function LoadingShipments() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-56" />
    </div>
  );
}
