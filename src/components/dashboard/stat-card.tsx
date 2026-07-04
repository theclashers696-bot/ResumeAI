"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: { value: number; label: string };
  gradient?: string;
  delay?: number;
}

export function StatCard({ title, value, description, icon, trend, gradient, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      {gradient && (
        <div
          className={cn("absolute inset-0 opacity-[0.06]", gradient)}
          aria-hidden
        />
      )}
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold tabular-nums">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                trend.value >= 0 ? "text-green-600" : "text-red-500"
              )}
            >
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div
          className={cn(
            "shrink-0 rounded-lg p-2.5",
            gradient ?? "bg-muted",
            gradient ? "text-white" : "text-muted-foreground"
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
