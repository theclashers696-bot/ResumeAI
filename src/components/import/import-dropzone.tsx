"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".json"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

type UploadState =
  | { status: "idle" }
  | { status: "dragging" }
  | { status: "selected"; file: File }
  | { status: "uploading"; file: File; progress: number }
  | { status: "success"; importId: string; fileName: string }
  | { status: "error"; message: string };

interface ImportDropzoneProps {
  onSuccess: (importId: string) => void;
}

function fileTypeIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return "PDF";
  if (ext === "docx") return "DOCX";
  if (ext === "json") return "JSON";
  return "TXT";
}

export function ImportDropzone({ onSuccess }: ImportDropzoneProps) {
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file type. Please upload ${ALLOWED_EXTENSIONS.join(", ")}`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File too large. Maximum size is ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setState({ status: "error", message: error });
      return;
    }
    setState({ status: "selected", file });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleUpload = async () => {
    if (state.status !== "selected") return;
    const file = state.file;

    setState({ status: "uploading", file, progress: 10 });

    const formData = new FormData();
    formData.append("file", file);

    try {
      setState((prev) =>
        prev.status === "uploading" ? { ...prev, progress: 40 } : prev
      );

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      setState((prev) =>
        prev.status === "uploading" ? { ...prev, progress: 80 } : prev
      );

      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        throw new Error(json.error ?? "Upload failed");
      }

      const json = (await res.json()) as { data?: { id: string } };
      const importId = json.data?.id;

      if (!importId) throw new Error("No import ID returned");

      setState({ status: "success", importId, fileName: file.name });
      onSuccess(importId);
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Upload failed. Please try again.",
      });
    }
  };

  const reset = () => setState({ status: "idle" });

  const isDragging = state.status === "dragging";
  const isIdle = state.status === "idle" || state.status === "dragging";

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          if (state.status === "idle") setState({ status: "dragging" });
        }}
        onDragLeave={() => {
          if (state.status === "dragging") setState({ status: "idle" });
        }}
        onDrop={handleDrop}
        onClick={() => isIdle && inputRef.current?.click()}
        className={cn(
          "relative flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50",
          (state.status === "uploading" || state.status === "success") &&
            "cursor-default pointer-events-none"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />

        <AnimatePresence mode="wait">
          {state.status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center gap-4 p-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  Drop your resume here
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {ALLOWED_EXTENSIONS.map((ext) => (
                  <span
                    key={ext}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {ext.toUpperCase().replace(".", "")}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Max {MAX_SIZE_MB} MB</p>
            </motion.div>
          )}

          {state.status === "dragging" && (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20"
              >
                <Upload className="h-8 w-8 text-primary" />
              </motion.div>
              <p className="text-base font-semibold text-primary">Release to upload</p>
            </motion.div>
          )}

          {state.status === "selected" && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{state.file.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {fileTypeIcon(state.file.name)} ·{" "}
                  {(state.file.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {state.status === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full flex-col items-center gap-6 p-8"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div className="w-full max-w-xs space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Parsing resume…</span>
                  <span className="font-medium text-foreground">
                    {state.progress}%
                  </span>
                </div>
                <Progress value={state.progress} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground">
                AI is extracting your information
              </p>
            </motion.div>
          )}

          {state.status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10"
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </motion.div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  Resume parsed successfully!
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {state.fileName}
                </p>
              </div>
            </motion.div>
          )}

          {state.status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 p-8 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <p className="text-base font-semibold text-destructive">Upload failed</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  {state.message}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="absolute right-3 top-3 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Action Button */}
      <AnimatePresence>
        {state.status === "selected" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <Button onClick={handleUpload} className="w-full gap-2" size="lg">
              <File className="h-4 w-4" />
              Parse Resume with AI
            </Button>
          </motion.div>
        )}
        {state.status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Button onClick={reset} variant="outline" className="w-full" size="lg">
              Try Another File
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
