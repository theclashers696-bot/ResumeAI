"use client";

import { useCallback, useEffect, useState } from "react";

export interface CreditStatus {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
  cycleStart: string;
}

export function useAICredits() {
  const [credits, setCredits] = useState<CreditStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/credits");
      const json = await res.json();
      if (res.ok) setCredits(json.data as CreditStatus);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { credits, loading, refresh };
}
