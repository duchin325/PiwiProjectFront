// src/app/(main)/dashboard/loading.tsx
import { Skeleton } from '@/components/ui/Skeleton';

export default function LoadingDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-10" />
      <Skeleton className="h-48" />
    </div>
  );
}
