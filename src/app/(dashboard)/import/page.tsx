"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, History, Plus, GitMerge } from "lucide-react";
import { ImportDropzone } from "@/components/import/import-dropzone";
import { ImportHistoryTable } from "@/components/import/import-history-table";
import { MergeDialog } from "@/components/import/merge-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToastContext } from "@/components/ui/toaster";

export default function ImportPage() {
  const router = useRouter();
  const { toast } = useToastContext();
  const [pendingImportId, setPendingImportId] = useState<string | null>(null);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [tab, setTab] = useState("upload");

  const handleUploadSuccess = (importId: string) => {
    setPendingImportId(importId);
    toast({
      title: "Resume parsed!",
      description: "Review and apply the import below.",
      variant: "success",
    });
  };

  const handleCreateNew = () => {
    if (!pendingImportId) return;
    router.push(`/import/${pendingImportId}`);
  };

  const handleMergeSuccess = (resumeId: string) => {
    router.push(`/resumes/${resumeId}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-2xl font-bold tracking-tight">Import Resume</h1>
        <p className="text-sm text-muted-foreground">
          Upload an existing resume and let AI convert it into a fully editable ResumeAI resume.
        </p>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Import History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6 space-y-6">
          {/* Supported formats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {[
              { ext: "PDF", desc: "Adobe PDF" },
              { ext: "DOCX", desc: "Microsoft Word" },
              { ext: "TXT", desc: "Plain text" },
              { ext: "JSON", desc: "ResumeAI backup" },
            ].map((f) => (
              <div
                key={f.ext}
                className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted/30 p-3 text-center"
              >
                <span className="text-lg font-bold text-primary">{f.ext}</span>
                <span className="text-xs text-muted-foreground">{f.desc}</span>
              </div>
            ))}
          </motion.div>

          <ImportDropzone onSuccess={handleUploadSuccess} />

          {/* Post-upload actions */}
          {pendingImportId && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-primary/20 bg-primary/5 p-4"
            >
              <p className="mb-3 text-sm font-medium text-foreground">
                Resume parsed! What would you like to do?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleCreateNew} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Resume
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMergeOpen(true)}
                  className="gap-2"
                >
                  <GitMerge className="h-4 w-4" />
                  Merge into Existing
                </Button>
              </div>
            </motion.div>
          )}

          {/* Tips */}
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Tips for best results
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Use a text-based PDF (not a scanned image)</li>
              <li>• DOCX files from Microsoft Word work best</li>
              <li>• Export your ResumeAI resume as JSON for perfect import</li>
              <li>• AI will enhance and normalize your data automatically</li>
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ImportHistoryTable />
        </TabsContent>
      </Tabs>

      {pendingImportId && (
        <MergeDialog
          importId={pendingImportId}
          open={mergeOpen}
          onOpenChange={setMergeOpen}
          onSuccess={handleMergeSuccess}
        />
      )}
    </div>
  );
}
