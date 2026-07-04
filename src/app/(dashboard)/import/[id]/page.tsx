"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle, Wand2, GitMerge, Plus, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ParsedResumePreview } from "@/components/import/parsed-resume-preview";
import { DuplicateDetector } from "@/components/import/duplicate-detector";
import { MergeDialog } from "@/components/import/merge-dialog";
import { useToastContext } from "@/components/ui/toaster";
import type { ParsedResume } from "@/lib/resume-parser";

interface ImportRecord {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  parsedData: ParsedResume | null;
  aiEnhanced: ParsedResume | null;
  resumeId: string | null;
  errorMessage: string | null;
  resume: { id: string; title: string; slug: string } | null;
}

export default function ImportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToastContext();

  const [record, setRecord] = useState<ImportRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/import/${id}`);
      if (!res.ok) throw new Error("Not found");
      const json = (await res.json()) as { data?: ImportRecord };
      const rec = json.data ?? null;
      setRecord(rec);
      if (rec) {
        setParsedData((rec.aiEnhanced ?? rec.parsedData) as ParsedResume | null);
      }
    } catch {
      toast({ title: "Failed to load import", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateNew = async () => {
    if (!record) return;
    setApplying(true);
    try {
      const res = await fetch(`/api/import/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "create" }),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? "Apply failed");
      }
      const j = (await res.json()) as { data?: { resumeId: string } };
      toast({ title: "Resume created!", variant: "success" });
      router.push(`/resumes/${j.data?.resumeId}`);
    } catch (err) {
      toast({
        title: "Failed to create resume",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "error",
      });
    } finally {
      setApplying(false);
    }
  };

  const handleMergeSuccess = (resumeId: string) => {
    router.push(`/resumes/${resumeId}`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="font-medium">Import not found</p>
        <Link href="/import" className="mt-2 block text-sm text-primary hover:underline">
          Back to Imports
        </Link>
      </div>
    );
  }

  const isCompleted = record.status === "COMPLETED";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/import">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold">{record.fileName}</h1>
          <p className="text-xs text-muted-foreground capitalize">
            {record.fileType.toUpperCase()} · {record.status}
          </p>
        </div>
      </div>

      {/* Completed banner */}
      {isCompleted && record.resume && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-xl border border-green-500/30 bg-green-500/5 p-4"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Import completed</p>
              <p className="text-xs text-muted-foreground">
                Resume: {record.resume.title}
              </p>
            </div>
          </div>
          <Link href={`/resumes/${record.resume.id}`}>
            <Button size="sm" variant="outline">
              Open Resume
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Error banner */}
      {record.status === "FAILED" && record.errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{record.errorMessage}</p>
        </div>
      )}

      {/* Duplicate detector */}
      {parsedData && (
        <DuplicateDetector data={parsedData} onCleanup={setParsedData} />
      )}

      {/* Parsed preview */}
      {parsedData ? (
        <>
          <ParsedResumePreview data={parsedData} />

          {!isCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3 rounded-xl border border-border bg-muted/30 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Apply this import</p>
                <p className="text-xs text-muted-foreground">
                  Create a new resume or merge into an existing one
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMergeOpen(true)}
                  disabled={applying}
                  className="gap-2"
                >
                  <GitMerge className="h-4 w-4" />
                  Merge
                </Button>
                <Button onClick={handleCreateNew} disabled={applying} className="gap-2">
                  {applying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create New Resume
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-12 text-center">
          <Wand2 className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {record.status === "PARSING"
              ? "AI is parsing your resume…"
              : "No parsed data available"}
          </p>
        </div>
      )}

      <MergeDialog
        importId={id}
        open={mergeOpen}
        onOpenChange={setMergeOpen}
        onSuccess={handleMergeSuccess}
      />
    </div>
  );
}
