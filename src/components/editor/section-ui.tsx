"use client";

import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export const SectionHeader = memo(function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
});

export const SectionCard = memo(function SectionCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-sm", className)}>
      {title && <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>}
      {children}
    </div>
  );
});

export const FieldGroup = memo(function FieldGroup({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
});

export function Divider() {
  return <div className="h-px bg-border" />;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function ItemCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-card p-4 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function ItemActions({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  isFirst,
  isLast,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate?: () => void;
  onDelete: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onMoveUp}
        disabled={isFirst}
        className="rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground disabled:opacity-30 transition-colors"
        aria-label="Move up"
        title="Move up"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
      <button
        onClick={onMoveDown}
        disabled={isLast}
        className="rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground disabled:opacity-30 transition-colors"
        aria-label="Move down"
        title="Move down"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {onDuplicate && (
        <button
          onClick={onDuplicate}
          className="rounded p-1 text-muted-foreground/60 hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Duplicate"
          title="Duplicate"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      )}
      <button
        onClick={onDelete}
        className="rounded p-1 text-muted-foreground/60 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 transition-colors"
        aria-label="Delete"
        title="Delete"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3,6 5,6 21,6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  );
}
