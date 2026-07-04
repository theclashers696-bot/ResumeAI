"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, Trash2, Loader2, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/components/ui/toaster";
import { formatDate } from "@/lib/utils";

export interface Draft {
  id: string;
  title: string;
  resumeId: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
  /** Full resume snapshot stored by autosave. Present when fetched from the API. */
  data?: Record<string, unknown>;
}

interface RecoveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (draft: Draft) => void;
  /**
   * When provided, only drafts whose `resumeId` matches this value are shown.
   * Prevents restoring a different resume's draft into the current editor session.
   */
  resumeId?: string;
}

export function RecoveryDialog({ open, onOpenChange, onRestore, resumeId }: RecoveryDialogProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToastContext();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/drafts")
      .then((r) => r.json())
      .then((j: { data?: Draft[] }) => {
        const all = j.data ?? [];
        // Scope to the current resume when a resumeId filter is provided.
        setDrafts(resumeId ? all.filter((d) => d.resumeId === resumeId) : all);
      })
      .catch(() => toast({ title: "Failed to load drafts", variant: "error" }))
      .finally(() => setLoading(false));
  }, [open, resumeId, toast]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/drafts/${id}`, { method: "DELETE" });
      setDrafts((prev) => prev.filter((d) => d.id !== id));
      toast({ title: "Draft deleted", variant: "success" });
    } catch {
      toast({ title: "Failed to delete draft", variant: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" open={open} onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Recovered Drafts
          </DialogTitle>
          <DialogDescription>
            These drafts were automatically saved. Restore one to continue editing.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : drafts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">No drafts found.</p>
            </div>
          ) : (
            drafts.map((draft) => (
              <motion.div
                key={draft.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-lg border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{draft.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Saved {formatDate(draft.updatedAt)} · {draft.source}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onRestore(draft);
                      onOpenChange(false);
                    }}
                    className="h-7 gap-1 text-xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(draft.id)}
                    disabled={deletingId === draft.id}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    {deletingId === draft.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
