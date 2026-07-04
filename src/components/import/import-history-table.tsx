"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToastContext } from "@/components/ui/toaster";
import Link from "next/link";

interface ImportRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: string;
  resumeId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  resume: { id: string; title: string; slug: string } | null;
}

const STATUS_CONFIG: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; label: string; className: string }
> = {
  PENDING: { icon: Clock, label: "Pending", className: "text-muted-foreground" },
  PARSING: { icon: Loader2, label: "Parsing", className: "text-blue-500" },
  PARSED: { icon: CheckCircle2, label: "Parsed", className: "text-green-500" },
  IMPORTING: { icon: Loader2, label: "Importing", className: "text-blue-500" },
  COMPLETED: { icon: CheckCircle2, label: "Completed", className: "text-green-500" },
  FAILED: { icon: XCircle, label: "Failed", className: "text-destructive" },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ImportHistoryTable() {
  const [records, setRecords] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToastContext();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/import?pageSize=50");
      const json = (await res.json()) as { data?: ImportRecord[] };
      setRecords(json.data ?? []);
    } catch {
      toast({ title: "Failed to load import history", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/import/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRecords((prev) => prev.filter((r) => r.id !== id));
      toast({ title: "Import deleted", variant: "success" });
    } catch {
      toast({ title: "Failed to delete import", variant: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/60" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-12 text-center">
        <FileText className="h-10 w-10 text-muted-foreground/40" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">No imports yet</p>
          <p className="mt-0.5 text-xs text-muted-foreground/70">
            Upload a resume above to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{records.length} import{records.length !== 1 ? "s" : ""}</p>
        <Button variant="ghost" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {records.map((record) => {
          const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.PENDING;
          const StatusIcon = cfg.icon;
          return (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{record.fileName}</p>
                  <Badge variant="secondary" className="shrink-0 text-xs uppercase">
                    {record.fileType}
                  </Badge>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatBytes(record.fileSize)}</span>
                  <span>·</span>
                  <span>{format(new Date(record.createdAt), "MMM d, yyyy")}</span>
                  {record.resume && (
                    <>
                      <span>·</span>
                      <Link
                        href={`/resumes/${record.resume.id}`}
                        className="flex items-center gap-0.5 text-primary hover:underline"
                      >
                        {record.resume.title}
                        <ExternalLink className="ml-0.5 h-2.5 w-2.5" />
                      </Link>
                    </>
                  )}
                </div>
                {record.errorMessage && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {record.errorMessage}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className={`flex items-center gap-1 text-xs font-medium ${cfg.className}`}>
                  <StatusIcon
                    className={`h-3.5 w-3.5 ${
                      ["PARSING", "IMPORTING"].includes(record.status) ? "animate-spin" : ""
                    }`}
                  />
                  {cfg.label}
                </span>

                {record.status === "PARSED" && (
                  <Link href={`/import/${record.id}`}>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Review
                    </Button>
                  </Link>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(record.id)}
                  disabled={deletingId === record.id}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  {deletingId === record.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
