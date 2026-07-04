import { Skeleton } from "@/components/ui/skeleton";

export default function AIStudioLoading() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border pb-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-t-lg" />
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-4 rounded-xl border border-border bg-card p-6">
          <Skeleton className="h-5 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
