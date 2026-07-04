"use client";

import { useState, useRef } from "react";
import {
  FileText,
  FileDown,
  Printer,
  Loader2,
  CheckCircle,
  X,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportDialogProps {
  resumeId: string;
  resumeTitle: string;
  onClose: () => void;
}

type ExportFormat = "pdf" | "docx" | "print";

const FORMATS: Array<{
  id: ExportFormat;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  badge?: string;
}> = [
  {
    id: "pdf",
    icon: FileText,
    label: "PDF",
    description: "High-quality PDF via browser print. ATS-friendly with real text.",
    badge: "Recommended",
  },
  {
    id: "docx",
    icon: FileDown,
    label: "DOCX",
    description: "Editable Word document. All sections, fonts, and formatting preserved.",
  },
  {
    id: "print",
    icon: Printer,
    label: "Print",
    description: "Open print dialog. Select any printer or save to PDF.",
  },
];

export function ExportDialog({ resumeId, resumeTitle, onClose }: ExportDialogProps) {
  const [selected, setSelected] = useState<ExportFormat>("pdf");
  const [pageSize, setPageSize] = useState<"A4" | "Letter">("A4");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleExport = async () => {
    setStatus("loading");
    setErrorMsg("");

    try {
      if (selected === "pdf") {
        // Open print page in a new tab – browser generates the PDF
        await fetch(`/api/resumes/${resumeId}/export/pdf-track`, { method: "POST" });
        const url = `/resumes/${resumeId}/print?size=${pageSize}`;
        window.open(url, "_blank");
        setStatus("done");
        return;
      }

      if (selected === "print") {
        window.print();
        setStatus("done");
        return;
      }

      if (selected === "docx") {
        const res = await fetch(`/api/resumes/${resumeId}/export/docx`);
        if (!res.ok) {
          const json = await res.json() as { error?: string };
          throw new Error(json.error ?? "Export failed");
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resumeTitle.replace(/[^a-z0-9]/gi, "_")}.docx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setStatus("done");
        return;
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Export failed");
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Export Resume</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3 p-6">
          {FORMATS.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setSelected(fmt.id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-all",
                selected === fmt.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/40 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                selected === fmt.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <fmt.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{fmt.label}</span>
                  {fmt.badge && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {fmt.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{fmt.description}</p>
              </div>
            </button>
          ))}

          {/* Page size option for PDF */}
          {selected === "pdf" && (
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Page size:</span>
                {(["A4", "Letter"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setPageSize(s)}
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                      pageSize === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {status === "error" && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <X className="h-4 w-4" />
              {errorMsg}
            </p>
          )}

          {status === "done" && (
            <p className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              {selected === "pdf" ? "Print dialog opened in a new tab." : "Download started!"}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => { void handleExport(); }}
            disabled={status === "loading"}
            className="gap-1.5"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            {selected === "pdf" ? "Export PDF" : selected === "docx" ? "Download DOCX" : "Print"}
          </Button>
        </div>

        {/* Hidden anchor for downloads */}
        <a ref={linkRef} className="hidden" />
      </div>
    </div>
  );
}
