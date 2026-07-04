"use client";

import { useCallback, useEffect, useState } from "react";

export interface AIHistoryItem {
  id: string;
  feature: string;
  prompt: string;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  status: string;
  createdAt: string;
  resumeId: string | null;
}

interface HistoryState {
  items: AIHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useAIHistory(feature?: string) {
  const [state, setState] = useState<HistoryState>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: "20",
          ...(feature ? { feature } : {}),
          ...(search ? { search } : {}),
        });
        const res = await fetch(`/api/ai/history?${params}`);
        const json = await res.json();
        if (res.ok && json.data) {
          setState(json.data as HistoryState);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [feature, search],
  );

  useEffect(() => {
    load(1);
  }, [load]);

  const deleteItem = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/ai/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setState((prev) => ({
          ...prev,
          items: prev.items.filter((i) => i.id !== id),
          total: prev.total - 1,
        }));
      }
      return res.ok;
    },
    [],
  );

  return {
    ...state,
    loading,
    search,
    setSearch,
    load,
    deleteItem,
  };
}
