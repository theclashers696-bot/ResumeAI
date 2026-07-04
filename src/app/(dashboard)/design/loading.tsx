import { Skeleton } from "@/components/ui/skeleton";

export default function DesignLoading() {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left panel */}
      <div className="w-72 border-r border-border bg-card p-4 space-y-4 shrink-0">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      {/* Center preview */}
      <div className="flex-1 bg-muted/20 flex items-center justify-center p-8">
        <Skeleton className="h-full w-full max-w-2xl rounded-xl" />
      </div>
    </div>
  );
}
