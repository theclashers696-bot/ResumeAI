"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Trash2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  Gauge,
  Target,
  Mail,
  Wand2,
  Star,
  Code,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIHistory, type AIHistoryItem } from "@/hooks/use-ai-history";

const FEATURE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  RESUME_GENERATE: { label: "Resume", icon: FileText, color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  SUMMARY_GENERATE: { label: "Summary", icon: Wand2, color: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
  EXPERIENCE_BULLETS: { label: "Bullets", icon: Star, color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  SKILLS_SUGGEST: { label: "Skills", icon: Code, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  PROJECT_DESCRIBE: { label: "Project", icon: Code, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300" },
  ACHIEVEMENT_WRITE: { label: "Achievement", icon: Trophy, color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
  COVER_LETTER: { label: "Cover Letter", icon: Mail, color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300" },
  ATS_ANALYSIS: { label: "ATS", icon: Gauge, color: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
  JOB_MATCH: { label: "Job Match", icon: Target, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" },
  CHAT_ASSISTANT: { label: "Chat", icon: MessageSquare, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

function getInputSummary(item: AIHistoryItem): string {
  if (!item.input) return item.prompt.slice(0, 80) + (item.prompt.length > 80 ? "…" : "");
  const inp = item.input as Record<string, unknown>;

  if (inp.jobTitle) return `${inp.jobTitle}${inp.targetCompany ? ` @ ${inp.targetCompany}` : ""}`;
  if (inp.position) return `${inp.position}${inp.company ? ` @ ${inp.company}` : ""}`;
  if (inp.context) return String(inp.context).slice(0, 80);
  if (inp.name) return String(inp.name);
  return item.prompt.slice(0, 80) + (item.prompt.length > 80 ? "…" : "");
}

function HistoryCard({
  item,
  onDelete,
}: {
  item: AIHistoryItem;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const meta = FEATURE_META[item.feature] ?? { label: item.feature, icon: Clock, color: "bg-muted text-muted-foreground" };
  const Icon = meta.icon;

  async function handleDelete() {
    setDeleting(true);
    await onDelete(item.id);
    setDeleting(false);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-accent/30"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
        <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-medium text-foreground">{getInputSummary(item)}</p>
        {item.status === "FAILED" && (
          <Badge variant="destructive" className="mt-1 text-[10px]">Failed</Badge>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        aria-label="Delete history item"
      >
        {deleting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>
    </motion.div>
  );
}

export function AIHistory() {
  const { items, loading, search, setSearch, load, deleteItem, page, totalPages, total } = useAIHistory();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI History</h2>
          <p className="text-sm text-muted-foreground">{total} generation{total !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => load(page)} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search history…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {search ? "No results for your search." : "No AI generations yet. Start generating!"}
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {items.map((item) => (
              <HistoryCard key={item.id} item={item} onDelete={deleteItem} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => load(page - 1)}
            className="gap-1.5"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Prev
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => load(page + 1)}
            className="gap-1.5"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
