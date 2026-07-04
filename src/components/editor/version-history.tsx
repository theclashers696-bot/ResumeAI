"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Plus, Trash2, RotateCcw, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/components/ui/toaster";
import type { ResumeData } from "@/types/resume";

interface Version {
  id: string;
  label: string;
  createdAt: string;
}

interface VersionHistoryProps {
  resumeId: string;
  currentData: ResumeData;
  onRestore: (data: ResumeData) => void;
  onClose: () => void;
  onSaveVersion: (label: string) => Promise<{ data: Version }>;
}

export function VersionHistory({
  resumeId,
  currentData,
  onRestore,
  onClose,
  onSaveVersion,
}: VersionHistoryProps) {
  const { toast } = useToastContext();
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const loadVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/resumes/${resumeId}/versions`);
      const { data } = await res.json();
      setVersions(data ?? []);
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  async function handleSave() {
    if (!newLabel.trim()) return;
    setIsSaving(true);
    try {
      const result = await onSaveVersion(newLabel.trim());
      setVersions((prev) => [result.data, ...prev]);
      setNewLabel("");
      toast({ title: "Snapshot saved", variant: "success" });
    } catch {
      toast({ title: "Failed to save snapshot", variant: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRestore(versionId: string) {
    setRestoringId(versionId);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/versions/${versionId}`);
      const { data } = await res.json();
      onRestore(data.snapshot as ResumeData);
      toast({ title: "Version restored", variant: "success" });
      onClose();
    } catch {
      toast({ title: "Failed to restore version", variant: "error" });
    } finally {
      setRestoringId(null);
    }
  }

  async function handleDelete(versionId: string) {
    try {
      await fetch(`/api/resumes/${resumeId}/versions/${versionId}`, { method: "DELETE" });
      setVersions((prev) => prev.filter((v) => v.id !== versionId));
      toast({ title: "Version deleted", variant: "success" });
    } catch {
      toast({ title: "Failed to delete", variant: "error" });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="absolute inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-border bg-background shadow-xl"
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Version History</h2>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Save new version */}
      <div className="border-b border-border p-3">
        <p className="mb-2 text-xs text-muted-foreground">Save current state as a named snapshot</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="e.g. Before interview round"
            className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            aria-label="Snapshot label"
          />
          <Button size="sm" className="h-8 shrink-0" onClick={handleSave} isLoading={isSaving}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Versions list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Clock className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No saved versions yet</p>
            <p className="text-xs text-muted-foreground/60">Save a snapshot above to start tracking history</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {versions.map((v) => (
              <div key={v.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors">
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground/60" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{v.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(v.createdAt).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRestore(v.id)}
                    isLoading={restoringId === v.id}
                    title="Restore this version"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(v.id)}
                    title="Delete this version"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
