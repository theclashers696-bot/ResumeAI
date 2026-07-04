"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitMerge, Loader2, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToastContext } from "@/components/ui/toaster";
import type { ResumeListItem } from "@/types";

interface MergeDialogProps {
  importId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (resumeId: string) => void;
}

export function MergeDialog({ importId, open, onOpenChange, onSuccess }: MergeDialogProps) {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [merging, setMerging] = useState(false);
  const { toast } = useToastContext();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/resumes?pageSize=50")
      .then((r) => r.json())
      .then((json: { data?: ResumeListItem[] }) => {
        setResumes(json.data ?? []);
      })
      .catch(() => {
        toast({ title: "Failed to load resumes", variant: "error" });
      })
      .finally(() => setLoading(false));
  }, [open, toast]);

  const handleMerge = async () => {
    if (!selected) return;
    setMerging(true);
    try {
      const res = await fetch(`/api/import/${importId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "merge", targetResumeId: selected }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Merge failed");
      }
      const json = (await res.json()) as { data?: { resumeId: string } };
      toast({ title: "Resume merged successfully", variant: "success" });
      onSuccess(selected);
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Merge failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "error",
      });
    } finally {
      setMerging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" open={open} onOpenChange={onOpenChange}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-primary" />
            Merge into Existing Resume
          </DialogTitle>
          <DialogDescription>
            Select a resume to merge the imported data into. New entries will be added without
            overwriting existing ones.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : resumes.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No resumes found. Create one first.
            </p>
          ) : (
            <RadioGroup value={selected} onValueChange={setSelected} className="space-y-2">
              {resumes.map((r) => (
                <motion.div
                  key={r.id}
                  whileHover={{ scale: 1.01 }}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    selected === r.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/70 hover:bg-muted/30"
                  }`}
                  onClick={() => setSelected(r.id)}
                >
                  <RadioGroupItem value={r.id} id={r.id} />
                  <Label htmlFor={r.id} className="flex-1 cursor-pointer">
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{r.template} template</p>
                  </Label>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              ))}
            </RadioGroup>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={merging}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMerge}
            disabled={!selected || merging}
            className="flex-1 gap-2"
          >
            {merging ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Merging…
              </>
            ) : (
              <>
                <GitMerge className="h-4 w-4" />
                Merge
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
