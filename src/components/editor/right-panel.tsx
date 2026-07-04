"use client";

import { memo, useRef, useCallback, useState } from "react";
import { Monitor, Smartphone, ZoomIn, ZoomOut, FileDown, Share2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResumeData } from "@/types/resume";
import { ResumePreview } from "@/components/resume/resume-preview";
import { ExportDialog } from "@/components/resume/export-dialog";
import { ShareDialog } from "@/components/resume/share-dialog";
import Link from "next/link";

interface RightPanelProps {
  data: ResumeData;
  resumeId: string;
  resumeSlug: string;
  isPublic: boolean;
  previewMode: "desktop" | "mobile";
  previewZoom: number;
  onSetMode: (mode: "desktop" | "mobile") => void;
  onSetZoom: (zoom: number) => void;
  onPrint: () => void;
}

const ZOOM_STEPS = [50, 75, 100, 125, 150];

export const RightPanel = memo(function RightPanel({
  data,
  resumeId,
  resumeSlug,
  isPublic,
  previewMode,
  previewZoom,
  onSetMode,
  onSetZoom,
  onPrint,
}: RightPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleZoomIn = useCallback(() => {
    const next = ZOOM_STEPS.find((z) => z > previewZoom) ?? 150;
    onSetZoom(next);
  }, [previewZoom, onSetZoom]);

  const handleZoomOut = useCallback(() => {
    const prev = [...ZOOM_STEPS].reverse().find((z) => z < previewZoom) ?? 50;
    onSetZoom(prev);
  }, [previewZoom, onSetZoom]);

  return (
    <>
      <aside className="flex h-full w-full flex-col border-l border-border bg-muted/30">
        {/* Toolbar */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-3">
          <div className="flex items-center gap-1">
            <Button
              variant={previewMode === "desktop" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2"
              onClick={() => onSetMode("desktop")}
              title="Desktop preview"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden text-xs lg:block">Desktop</span>
            </Button>
            <Button
              variant={previewMode === "mobile" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 px-2"
              onClick={() => onSetMode("mobile")}
              title="Mobile preview"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden text-xs lg:block">Mobile</span>
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} disabled={previewZoom <= 50}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="min-w-10 text-center text-xs text-muted-foreground">{previewZoom}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} disabled={previewZoom >= 150}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>

            <div className="mx-1 h-4 w-px bg-border" />

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowShare(true)}
              title="Share resume"
            >
              <Share2 className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowExport(true)}
              title="Export PDF / DOCX"
            >
              <FileDown className="h-3.5 w-3.5" />
            </Button>

            <Link href={`/resumes/${resumeId}/analytics`} title="View analytics">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Preview area */}
        <div
          ref={containerRef}
          className="flex flex-1 items-start justify-center overflow-auto p-4"
        >
          <div
            className={cn(
              "transition-all duration-200",
              previewMode === "mobile" ? "w-[380px]" : "w-[794px]"
            )}
            style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: "top center" }}
          >
            <div
              className="bg-white shadow-2xl"
              style={{ minHeight: "1122px" }}
            >
              <ResumePreview data={data} />
            </div>
          </div>
        </div>
      </aside>

      {/* Export dialog */}
      {showExport && (
        <ExportDialog
          resumeId={resumeId}
          resumeTitle={data.title}
          onClose={() => setShowExport(false)}
        />
      )}

      {/* Share dialog */}
      {showShare && (
        <ShareDialog
          resumeId={resumeId}
          resumeTitle={data.title}
          resumeSlug={resumeSlug}
          isPublic={isPublic}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
});
