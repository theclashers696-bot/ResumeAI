"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/use-ai-credits";
import { Skeleton } from "@/components/ui/skeleton";

export function CreditStatus({ refreshKey }: { refreshKey?: number }) {
  const { credits, loading, refresh } = useAICredits();

  React.useEffect(() => {
    if (refreshKey !== undefined) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (loading) return <Skeleton className="h-9 w-40 rounded-full" />;
  if (!credits) return null;

  const pct = credits.limit > 0 ? Math.min(100, Math.round((credits.used / credits.limit) * 100)) : 0;

  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
      <Sparkles className="h-4 w-4 text-purple-500" />
      <div className="text-sm">
        <span className="font-semibold">{credits.remaining}</span>
        <span className="text-muted-foreground"> / {credits.limit} credits left</span>
      </div>
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
