"use client";

import { useEffect, useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useToastContext } from "@/components/ui/toaster";
import { useResumeEditor } from "@/hooks/use-resume-editor";
import { EditorHeader } from "@/components/editor/editor-header";
import { LeftPanel } from "@/components/editor/left-panel";
import { CenterPanel } from "@/components/editor/center-panel";
import { RightPanel } from "@/components/editor/right-panel";
import { ThemePanel } from "@/components/editor/theme-panel";
import { VersionHistory } from "@/components/editor/version-history";
import { RecoveryDialog, type Draft } from "@/components/recovery/recovery-dialog";
import type { ResumeData, ResumeTheme } from "@/types/resume";
import { nanoid } from "@/lib/utils";
import { ResumePreview } from "@/components/resume/resume-preview";

interface Props {
  params: { id: string };
}

export default function ResumeEditorPage({ params }: Props) {
  const { id } = params;
  const { toast } = useToastContext();
  const [showTheme, setShowTheme] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [resumeSlug, setResumeSlug] = useState("");

  const editor = useResumeEditor(id);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    editor.loadResume()
      .then(() => {
        // After loading, check whether an autosaved draft exists for this resume.
        return fetch("/api/drafts")
          .then((r) => r.json())
          .then((j: { data?: Array<{ resumeId: string | null }> }) => {
            const hasDraft = (j.data ?? []).some((d) => d.resumeId === id);
            if (hasDraft) setShowRecovery(true);
          })
          .catch(() => undefined); // Draft check is non-critical
      })
      .catch(() => {
        toast({ title: "Failed to load resume", variant: "error" });
      });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Capture slug when resume data first loads
  useEffect(() => {
    if (editor.data?.slug && !resumeSlug) {
      setResumeSlug(editor.data.slug);
    }
  }, [editor.data?.slug, resumeSlug]);

  // Fallback: fetch slug from list API if not in ResumeData
  useEffect(() => {
    if (!resumeSlug) {
      void fetch(`/api/resumes/${id}`)
        .then((r) => r.json())
        .then((j: { data?: { slug?: string } }) => {
          if (j.data?.slug) setResumeSlug(j.data.slug);
        })
        .catch(() => {});
    }
  }, [id, resumeSlug]);

  const handleUpdate = useCallback(
    (updates: Partial<ResumeData>) => {
      editor.update(updates);
    },
    [editor]
  );

  const handleThemeChange = useCallback(
    (updates: Partial<ResumeTheme>) => {
      if (!editor.data) return;
      editor.update({ theme: { ...editor.data.theme, ...updates } });
    },
    [editor]
  );

  const handleTemplateChange = useCallback(
    (template: string) => {
      editor.update({ template });
    },
    [editor]
  );

  const handleSectionReorder = useCallback(
    (newOrder: string[]) => {
      editor.update({ sectionOrder: newOrder });
    },
    [editor]
  );

  const handleAddCustomSection = useCallback(() => {
    if (!editor.data) return;
    const sectionId = nanoid();
    const newSection = {
      id: sectionId,
      title: "Custom Section",
      content: [],
      order: editor.data.customSections.length,
    };
    editor.update({
      customSections: [...editor.data.customSections, newSection],
      sectionOrder: [...editor.data.sectionOrder, `custom-${sectionId}`],
    });
    editor.setActiveSection(`custom-${sectionId}`);
  }, [editor]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleRestoreVersion = useCallback(
    (data: ResumeData) => {
      editor.update(data);
    },
    [editor]
  );

  const handleRestoreDraft = useCallback(
    (draft: Draft) => {
      if (!draft.data) {
        toast({ title: "Draft data missing — cannot restore", variant: "error" });
        setShowRecovery(false);
        return;
      }
      editor.update(draft.data as unknown as ResumeData);
      toast({ title: "Draft restored successfully", variant: "success" });
      setShowRecovery(false);
    },
    [editor, toast]
  );

  // Loading state
  if (!editor.data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading resume editor…</p>
        </div>
      </div>
    );
  }

  const data = editor.data;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body > *:not(#resume-print-area) { display: none !important; }
          #resume-print-area { display: block !important; position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9999; background: white; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      {/* Hidden print area */}
      <div id="resume-print-area" style={{ display: "none" }}>
        <ResumePreviewForPrint data={data} />
      </div>

      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background">
        <EditorHeader
          title={data.title}
          saveStatus={editor.saveStatus}
          lastSaved={editor.lastSaved}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onSave={() => editor.saveResume(data)}
          onOpenVersionHistory={() => {
            setShowVersionHistory(true);
            setShowTheme(false);
          }}
          onOpenTheme={() => {
            setShowTheme((v) => !v);
            setShowVersionHistory(false);
          }}
          onPrint={handlePrint}
        />

        <div className="relative flex flex-1 overflow-hidden">
          {/* Left — section navigator */}
          <LeftPanel
            data={data}
            activeSection={editor.activeSection}
            onSectionClick={editor.setActiveSection}
            onSectionReorder={handleSectionReorder}
            onAddCustomSection={handleAddCustomSection}
          />

          {/* Center — editors */}
          <CenterPanel
            data={data}
            activeSection={editor.activeSection}
            onUpdate={handleUpdate}
          />

          {/* Right — live preview */}
          <RightPanel
            data={data}
            resumeId={id}
            resumeSlug={resumeSlug}
            isPublic={data.isPublic}
            previewMode={editor.previewMode}
            previewZoom={editor.previewZoom}
            onSetMode={editor.setPreviewMode}
            onSetZoom={editor.setPreviewZoom}
            onPrint={handlePrint}
          />

          {/* Theme panel overlay */}
          <AnimatePresence>
            {showTheme && (
              <div className="absolute inset-y-0 right-0 z-50 flex">
                <ThemePanel
                  theme={data.theme}
                  template={data.template}
                  onThemeChange={handleThemeChange}
                  onTemplateChange={handleTemplateChange}
                  onClose={() => setShowTheme(false)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Version history overlay */}
          <AnimatePresence>
            {showVersionHistory && (
              <VersionHistory
                resumeId={id}
                currentData={data}
                onRestore={handleRestoreVersion}
                onClose={() => setShowVersionHistory(false)}
                onSaveVersion={editor.saveVersion}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Autosave recovery dialog — scoped to this resume only */}
      <RecoveryDialog
        open={showRecovery}
        onOpenChange={setShowRecovery}
        onRestore={handleRestoreDraft}
        resumeId={id}
      />
    </>
  );
}

// Full resume rendered for printing
function ResumePreviewForPrint({ data }: { data: ResumeData }) {
  return (
    <div style={{ width: "210mm", minHeight: "297mm", background: "white" }}>
      <ResumePreview data={data} />
    </div>
  );
}
