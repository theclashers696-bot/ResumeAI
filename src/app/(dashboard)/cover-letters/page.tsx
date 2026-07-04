"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Mail,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Eye,
  X,
  Download,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CoverLetter {
  id: string;
  jobTitle: string;
  company: string;
  tone: string;
  content: string;
  createdAt: string;
}

function ToneTag({ tone }: { tone: string }) {
  const colors: Record<string, string> = {
    professional: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    enthusiastic: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    confident: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    formal: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", colors[tone] ?? colors.professional)}>
      {tone}
    </span>
  );
}

function LetterModal({ letter, onClose }: { letter: CoverLetter; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(letter.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleDownload() {
    const blob = new Blob([letter.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${letter.company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-semibold">{letter.jobTitle}</h2>
            <p className="text-sm text-muted-foreground">{letter.company}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{letter.content}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CoverLettersPage() {
  const [letters, setLetters] = useState<CoverLetter[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewLetter, setViewLetter] = useState<CoverLetter | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ai/cover-letter")
      .then((res) => res.json())
      .then((json) => setLetters((json.data ?? []) as CoverLetter[]))
      .catch(() => setLetters([]));
  }, []);

  function handleCopy(letter: CoverLetter) {
    navigator.clipboard.writeText(letter.content);
    setCopiedId(letter.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function handleDownload(letter: CoverLetter) {
    const blob = new Blob([letter.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${letter.company.toLowerCase().replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/cover-letters/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLetters((prev) => prev?.filter((l) => l.id !== id) ?? null);
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="mb-1 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-lg">
                <Mail className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Cover Letters</h1>
            </div>
            <p className="text-muted-foreground">
              {letters ? `${letters.length} cover letter${letters.length !== 1 ? "s" : ""} generated` : "All AI-generated cover letters"}
            </p>
          </div>
          <Link
            href="/ai-studio?tab=cover-letter"
            className={cn(
              buttonVariants(),
              "gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
            )}
          >
            <Sparkles className="h-4 w-4" />
            New Cover Letter
          </Link>
        </motion.div>

        {/* Content */}
        {letters === null ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : letters.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Mail className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold">No cover letters yet</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    Generate a tailored cover letter for any job in seconds using AI Studio.
                  </p>
                </div>
                <Link
                  href="/ai-studio?tab=cover-letter"
                  className={cn(
                    buttonVariants(),
                    "mt-2 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate your first cover letter
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {letters.map((letter, i) => (
                <motion.div
                  key={letter.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="group flex h-full flex-col hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <CardTitle className="truncate text-base">{letter.jobTitle}</CardTitle>
                          <CardDescription className="mt-0.5 truncate">{letter.company}</CardDescription>
                        </div>
                        <ToneTag tone={letter.tone} />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(letter.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-3">
                      <p className="line-clamp-4 flex-1 whitespace-pre-line text-sm text-muted-foreground">
                        {letter.content}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5"
                          onClick={() => setViewLetter(letter)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => handleCopy(letter)}
                        >
                          {copiedId === letter.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => handleDownload(letter)}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 hover:border-destructive hover:text-destructive"
                          onClick={() => handleDelete(letter.id)}
                          disabled={deletingId === letter.id}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Full-content modal */}
      <AnimatePresence>
        {viewLetter && (
          <LetterModal letter={viewLetter} onClose={() => setViewLetter(null)} />
        )}
      </AnimatePresence>
    </>
  );
}
