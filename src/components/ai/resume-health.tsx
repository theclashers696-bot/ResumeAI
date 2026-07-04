"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, AlertTriangle, CheckCircle, Loader2, ChevronDown, ChevronUp,
  Zap, Eye, FileText, BookOpen, Users, Code2
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyResumes } from "@/hooks/use-my-resumes";
import { cn } from "@/lib/utils";

interface WeakSection { section: string; issue: string; fix: string }

interface HealthResult {
  id: string;
  overallScore: number;
  formattingScore: number;
  contentScore: number;
  keywordScore: number;
  grammarScore: number;
  readabilityScore: number;
  recruiterScore: number;
  weakSections: WeakSection[];
  strongSections: string[];
  longSentences: string[];
  passiveVoice: string[];
  actionVerbsUsed: string[];
  buzzwords: string[];
  grammarIssues: string[];
  suggestions: string[];
}

function ScoreBar({ label, score, icon: Icon, color }: { label: string; score: number; icon: React.ComponentType<{ className?: string }>; color: string }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-medium">
          <Icon className={cn("h-3.5 w-3.5", color)} />
          {label}
        </span>
        <span className={cn("font-semibold tabular-nums", pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-600")}>
          {pct}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500")}
        />
      </div>
    </div>
  );
}

function CollapsibleSection({ title, items, variant = "neutral", children }: {
  title: string; items?: unknown[]; variant?: "good" | "bad" | "neutral"; children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const count = items?.length ?? 0;
  if (count === 0 && !children) return null;
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className={cn("font-medium text-sm", variant === "good" ? "text-emerald-700 dark:text-emerald-400" : variant === "bad" ? "text-red-700 dark:text-red-400" : "text-foreground")}>
          {title} {count > 0 && <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>}
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
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
            <div className="border-t border-border px-4 py-3 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ResumeHealthAnalyzer({ onGenerated }: { onGenerated?: () => void }) {
  const { resumes, loading: resumesLoading } = useMyResumes();
  const [resumeId, setResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HealthResult | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/resume-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const json = await res.json() as { data?: HealthResult; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed");
      if (json.data) { setResult(json.data); onGenerated?.(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  const radarData = result ? [
    { subject: "Formatting", score: result.formattingScore },
    { subject: "Content", score: result.contentScore },
    { subject: "Keywords", score: result.keywordScore },
    { subject: "Grammar", score: result.grammarScore },
    { subject: "Readability", score: result.readabilityScore },
    { subject: "Recruiter", score: result.recruiterScore },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Input card */}
      <Card className="border-rose-200/50 bg-gradient-to-b from-card to-rose-50/20 dark:border-rose-900/30 dark:to-rose-950/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow">
              <Heart className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Resume Health Check</CardTitle>
              <CardDescription>Deep analysis across 7 quality dimensions.</CardDescription>
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
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleAnalyze}
            disabled={!resumeId || loading}
            className="w-full gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</> : <><Heart className="h-4 w-4" /> Run Health Check</>}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div key="health-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Score overview */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Radar chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Score Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip formatter={(v: number) => [`${v}/100`, ""]} />
                      <Radar dataKey="score" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.25} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Overall + bars */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={cn(
                    "mb-4 flex items-center gap-4 rounded-xl p-4",
                    result.overallScore >= 75 ? "bg-emerald-50 dark:bg-emerald-950/20" : result.overallScore >= 50 ? "bg-amber-50 dark:bg-amber-950/20" : "bg-red-50 dark:bg-red-950/20"
                  )}>
                    <span className={cn("text-5xl font-bold tabular-nums", result.overallScore >= 75 ? "text-emerald-600" : result.overallScore >= 50 ? "text-amber-600" : "text-red-600")}>
                      {result.overallScore}
                    </span>
                    <div>
                      <p className={cn("font-semibold", result.overallScore >= 75 ? "text-emerald-600" : result.overallScore >= 50 ? "text-amber-600" : "text-red-600")}>
                        {result.overallScore >= 75 ? "Excellent" : result.overallScore >= 50 ? "Good — needs work" : "Needs improvement"}
                      </p>
                      <p className="text-xs text-muted-foreground">Overall Health Score</p>
                    </div>
                  </div>
                  <ScoreBar label="Formatting" score={result.formattingScore} icon={FileText} color="text-blue-500" />
                  <ScoreBar label="Content" score={result.contentScore} icon={BookOpen} color="text-purple-500" />
                  <ScoreBar label="Keywords" score={result.keywordScore} icon={Code2} color="text-orange-500" />
                  <ScoreBar label="Grammar" score={result.grammarScore} icon={Eye} color="text-teal-500" />
                  <ScoreBar label="Readability" score={result.readabilityScore} icon={Zap} color="text-yellow-500" />
                  <ScoreBar label="Recruiter Appeal" score={result.recruiterScore} icon={Users} color="text-pink-500" />
                </CardContent>
              </Card>
            </div>

            {/* Detail sections */}
            <div className="space-y-3">
              {(result.weakSections as WeakSection[]).length > 0 && (
                <CollapsibleSection title="⚠️ Weak Sections" items={result.weakSections} variant="bad">
                  {(result.weakSections as WeakSection[]).map((s, i) => (
                    <div key={i} className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-sm">
                      <p className="font-medium text-red-800 dark:text-red-300">{s.section}</p>
                      <p className="text-red-700 dark:text-red-400 mt-0.5">{s.issue}</p>
                      <p className="text-emerald-700 dark:text-emerald-400 mt-1">💡 {s.fix}</p>
                    </div>
                  ))}
                </CollapsibleSection>
              )}

              {(result.strongSections as string[]).length > 0 && (
                <CollapsibleSection title="✅ Strong Sections" items={result.strongSections} variant="good">
                  <div className="flex flex-wrap gap-2">
                    {(result.strongSections as string[]).map((s, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1 text-sm text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="h-3 w-3" /> {s}
                      </span>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {(result.passiveVoice as string[]).length > 0 && (
                <CollapsibleSection title="🔴 Passive Voice Detected" items={result.passiveVoice} variant="bad">
                  {(result.passiveVoice as string[]).map((p, i) => (
                    <p key={i} className="rounded bg-red-50 dark:bg-red-950/20 px-3 py-1.5 text-sm italic text-red-700 dark:text-red-400">
                      &ldquo;{p}&rdquo;
                    </p>
                  ))}
                </CollapsibleSection>
              )}

              {(result.actionVerbsUsed as string[]).length > 0 && (
                <CollapsibleSection title="✅ Action Verbs Used" items={result.actionVerbsUsed} variant="good">
                  <div className="flex flex-wrap gap-2">
                    {(result.actionVerbsUsed as string[]).map((v, i) => (
                      <span key={i} className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:text-emerald-300">{v}</span>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {(result.buzzwords as string[]).length > 0 && (
                <CollapsibleSection title="⚠️ Buzzword Overuse" items={result.buzzwords} variant="bad">
                  <div className="flex flex-wrap gap-2">
                    {(result.buzzwords as string[]).map((b, i) => (
                      <span key={i} className="rounded-full bg-amber-100 dark:bg-amber-950/30 px-2.5 py-1 text-xs text-amber-800 dark:text-amber-300">{b}</span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Replace these with specific, quantified achievements.</p>
                </CollapsibleSection>
              )}

              {(result.grammarIssues as string[]).length > 0 && (
                <CollapsibleSection title="📝 Grammar Issues" items={result.grammarIssues}>
                  {(result.grammarIssues as string[]).map((g, i) => (
                    <p key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> {g}
                    </p>
                  ))}
                </CollapsibleSection>
              )}

              {(result.suggestions as string[]).length > 0 && (
                <CollapsibleSection title="💡 AI Suggestions" items={result.suggestions}>
                  {(result.suggestions as string[]).map((s, i) => (
                    <p key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-0.5 shrink-0 text-purple-500">•</span> {s}
                    </p>
                  ))}
                </CollapsibleSection>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
