"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, ChevronDown, ChevronUp, Brain, Users, HelpCircle, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMyResumes } from "@/hooks/use-my-resumes";
import { cn } from "@/lib/utils";

interface TechnicalQ { question: string; answer: string; difficulty: string; tip: string }
interface BehavioralQ { question: string; answer: string; framework: string; competency: string }
interface HRQ { question: string; answer: string }

interface PrepResult {
  jobTitle: string;
  technical: TechnicalQ[];
  behavioral: BehavioralQ[];
  hr: HRQ[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  Hard: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="text-muted-foreground hover:text-foreground transition-colors"
      title="Copy answer"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function QCard({ question, answer, badge, badgeClass, extra }: {
  question: string; answer: string; badge?: string; badgeClass?: string; extra?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-start justify-between gap-3 p-4 text-left hover:bg-muted/40 transition-colors">
        <div className="flex-1 min-w-0">
          {badge && <span className={cn("mb-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium", badgeClass)}>{badge}</span>}
          <p className="font-medium text-sm">{question}</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-muted/30 px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Suggested Answer</p>
                <CopyButton text={answer} />
              </div>
              <p className="text-sm text-foreground whitespace-pre-line">{answer}</p>
              {extra}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function InterviewPrep({ onGenerated }: { onGenerated?: () => void }) {
  const { resumes, loading: resumesLoading } = useMyResumes();
  const [resumeId, setResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrepResult | null>(null);
  const [activeTab, setActiveTab] = useState<"technical" | "behavioral" | "hr">("technical");

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobTitle }),
      });
      const json = await res.json() as { data?: PrepResult; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed");
      if (json.data) { setResult(json.data); onGenerated?.(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate interview prep.");
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { id: "technical" as const, label: "Technical", icon: Brain, count: result?.technical.length },
    { id: "behavioral" as const, label: "Behavioral", icon: Users, count: result?.behavioral.length },
    { id: "hr" as const, label: "HR / Culture", icon: HelpCircle, count: result?.hr.length },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-violet-200/50 bg-gradient-to-b from-card to-violet-50/20 dark:border-violet-900/30 dark:to-violet-950/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow">
              <Mic className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Interview Preparation</CardTitle>
              <CardDescription>AI-generated technical, behavioral, and HR questions with suggested answers.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <select
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{resumesLoading ? "Loading…" : "Select a resume"}</option>
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          <Input
            placeholder="Target job title (e.g. Senior Frontend Engineer)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleGenerate}
            disabled={!resumeId || !jobTitle.trim() || loading}
            className="w-full gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating questions…</> : <><Mic className="h-4 w-4" /> Generate Interview Prep</>}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div key="prep-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Tab bar */}
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
                      activeTab === tab.id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {tab.count !== undefined && <span className="rounded-full bg-muted/80 px-1.5 py-0.5 text-xs">{tab.count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Technical questions */}
            {activeTab === "technical" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Click any question to reveal the suggested answer.</p>
                {result.technical.map((q, i) => (
                  <QCard
                    key={i}
                    question={q.question}
                    answer={q.answer}
                    badge={q.difficulty}
                    badgeClass={DIFFICULTY_COLORS[q.difficulty] ?? ""}
                    extra={q.tip && <p className="mt-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 px-3 py-2 text-xs text-blue-700 dark:text-blue-300">💡 {q.tip}</p>}
                  />
                ))}
              </div>
            )}

            {/* Behavioral questions */}
            {activeTab === "behavioral" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Answers follow the STAR framework (Situation → Task → Action → Result).</p>
                {result.behavioral.map((q, i) => (
                  <QCard
                    key={i}
                    question={q.question}
                    answer={q.answer}
                    badge={q.competency}
                    badgeClass="bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
                    extra={<p className="mt-1 text-xs text-muted-foreground">Framework: {q.framework}</p>}
                  />
                ))}
              </div>
            )}

            {/* HR questions */}
            {activeTab === "hr" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Culture, motivation, and fit questions.</p>
                {result.hr.map((q, i) => (
                  <QCard key={i} question={q.question} answer={q.answer} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
