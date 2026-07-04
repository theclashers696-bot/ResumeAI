"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Undo2, Redo2, Clock, Download,
  Share2, Eye, CheckCircle, AlertCircle, Loader2, History,
  Palette, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  title: string;
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onOpenVersionHistory: () => void;
  onOpenTheme: () => void;
  onPrint: () => void;
}

const SaveIndicator = memo(function SaveIndicator({
  status,
  lastSaved,
}: {
  status: EditorHeaderProps["saveStatus"];
  lastSaved: Date | null;
}) {
  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving…
      </span>
    );
  }
  if (status === "saved") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-600">
        <CheckCircle className="h-3 w-3" />
        {lastSaved ? `Saved ${formatTime(lastSaved)}` : "Saved"}
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-500">
        <AlertCircle className="h-3 w-3" />
        Save failed
      </span>
    );
  }
  return null;
});

function formatTime(date: Date) {
  const diff = Date.now() - date.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export const EditorHeader = memo(function EditorHeader({
  title,
  saveStatus,
  lastSaved,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onOpenVersionHistory,
  onOpenTheme,
  onPrint,
}: EditorHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <Link href="/resumes">
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Back to resumes">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>

      <div className="h-4 w-px bg-border" />

      <div className="hidden min-w-0 flex-1 sm:block">
        <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="h-4 w-px bg-border" />

      <SaveIndicator status={saveStatus} lastSaved={lastSaved} />

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="hidden h-8 gap-1.5 sm:flex"
          onClick={onOpenTheme}
          title="Theme & styling"
        >
          <Palette className="h-3.5 w-3.5" />
          <span className="text-xs">Theme</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="hidden h-8 gap-1.5 sm:flex"
          onClick={onOpenVersionHistory}
          title="Version history"
        >
          <History className="h-3.5 w-3.5" />
          <span className="text-xs">History</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={onPrint}
          title="Export / Print PDF"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden text-xs sm:block">Export</span>
        </Button>

        <Button
          size="sm"
          className="h-8 gap-1.5"
          onClick={onSave}
          title="Save (Ctrl+S)"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden text-xs sm:block">Save</span>
        </Button>
      </div>
    </header>
  );
});
