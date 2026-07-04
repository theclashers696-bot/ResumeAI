import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="flex-1 space-y-6 p-6 max-w-3xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Avatar section */}
      <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-6">
        <Skeleton className="h-20 w-20 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Form fields */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}
