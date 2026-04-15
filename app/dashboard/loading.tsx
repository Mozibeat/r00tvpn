import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-10 sm:px-6">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <Skeleton className="h-56" />
    </div>
  );
}
