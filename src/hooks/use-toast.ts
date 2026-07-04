"use client";

import { useState, useCallback } from "react";
import type { Toast, ToastVariant } from "@/types";

let toastCounter = 0;

function generateId() {
  return `toast-${++toastCounter}-${Date.now()}`;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    ({
      title,
      description,
      variant = "default",
      duration = 5000,
    }: Omit<Toast, "id">) => {
      const id = generateId();
      const toast: Toast = { id, title, description, variant, duration };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (options: Omit<Toast, "id">) => addToast(options),
    [addToast]
  );

  const success = useCallback(
    (title: string, description?: string) =>
      addToast({ title, description, variant: "success" as ToastVariant }),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) =>
      addToast({ title, description, variant: "error" as ToastVariant }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string) =>
      addToast({ title, description, variant: "warning" as ToastVariant }),
    [addToast]
  );

  return { toasts, toast, success, error, warning, removeToast };
}
