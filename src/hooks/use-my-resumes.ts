"use client";

import { useEffect, useState } from "react";

export interface ResumeOption {
  id: string;
  title: string;
}

export function useMyResumes() {
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/resumes?pageSize=50")
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        const items = (json.data ?? []) as ResumeOption[];
        setResumes(Array.isArray(items) ? items : []);
      })
      .catch(() => undefined)
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return { resumes, loading };
}
