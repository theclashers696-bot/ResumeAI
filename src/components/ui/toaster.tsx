"use client";

import React, { createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Toast } from "@/types";

type ToastContextValue = ReturnType<typeof useToast>;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastState = useToast();

  return (
    <ToastContext.Provider value={toastState}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider");
  return ctx;
}

const variantConfig = {
  default: {
    icon: Info,
    className: "bg-background border-border text-foreground",
    iconClassName: "text-foreground",
  },
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200 text-green-900",
    iconClassName: "text-green-600",
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-200 text-red-900",
    iconClassName: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-900",
    iconClassName: "text-yellow-600",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const variant = toast.variant ?? "default";
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-lg border p-4 shadow-lg",
        config.className
      )}
      role="alert"
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClassName)} />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description && (
          <p className="text-sm opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded-md p-1 opacity-60 hover:opacity-100 focus:outline-none"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;

  const { toasts, removeToast } = ctx;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
