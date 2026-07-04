"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/types";

function typeIcon(type: string) {
  switch (type) {
    case "SUCCESS":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "WARNING":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "ERROR":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/api/notifications")
        .then((r) => r.json())
        .then((data: { data?: NotificationItem[] }) => {
          setNotifications(data.data ?? []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [open]);

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  }

  async function deleteNotification(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await fetch("/api/notifications", { method: "PATCH" });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "group flex items-start gap-3 px-4 py-3 transition-colors",
                      !n.isRead && "bg-blue-50/50 dark:bg-blue-950/20"
                    )}
                  >
                    <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
                    <div className="min-w-0 flex-1" onClick={() => !n.isRead && markRead(n.id)}>
                      <p className={cn("text-sm", !n.isRead && "font-medium")}>{n.title}</p>
                      {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                      <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="shrink-0 rounded p-1 opacity-0 text-muted-foreground hover:text-destructive group-hover:opacity-100"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
