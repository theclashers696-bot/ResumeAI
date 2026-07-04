"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, CheckCircle, XCircle, AlertTriangle, Lightbulb, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMyResumes } from "@/hooks/use-my-resumes";
import { callAI, AIClientError } from "@/lib/ai/client";
import { cn } from "@/lib/utils";

interface ATSResult {
  score: number;
  summary: string | null;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestions: string[];
  weakSections?: string[];
  readabilityScore?: number;
  formattingIssues?: string[];
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-red-500";
  const bgColor = score >= 80 ? "bg-emerald-50 dark:bg-emerald-950/30" : score >= 50 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-red-50 dark:bg-red-950/30";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs Work" : "Poor";
  return (
    <div className={cn("flex items-center gap-4 rounded-xl p-4", bgColor)}>
      <div className={cn("text-5xl font-bold tabular-nums", color)}>{score}</div>
      <div>
        <p className={cn("text-lg font-semibold", color)}>{label}</p>
        <p className="text-sm text-muted-foreground">ATS Score / 100</p>
      </div>
    </div>
  );
}

function MiniScore({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}

export function ATSAnalyzer({ onGenerated }: { onGenerated?: () => void }) {
  const { resumes, loading: resumesLoading } = useMyResumes();
  const [resumeId, setResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ATSResult | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAI<ATSResult>("/api/ai/ats-analysis", { resumeId, jobDescription });
      setResult(data);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof AIClientError ? err.message : "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-orange-200/50 bg-gradient-to-b from-card to-orange-50/20 dark:border-orange-900/30 dark:to-orange-950/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">ATS Score Analyzer</CardTitle>
              <CardDescription>Check how well your resume passes automated screening.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Select Resume *</label>
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">{resumesLoading ? "Loading resumes…" : "Select a resume"}</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Job Description (optional — improves score accuracy)</label>
            <Textarea
              placeholder="Paste the target job description here for a tailored, accurate ATS score…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={7}
            />
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}
          <Button
            onClick={handleAnalyze}
            disabled={!resumeId || loading}
            isLoading={loading}
            className="w-full gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <Gauge className="h-4 w-4" />
            {loading ? "Analyzing…" : "Analyze Resume"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ATS Report</CardTitle>
          <CardDescription>Score, keywords, and actionable improvements.</CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-12"
              >
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 animate-ping rounded-full bg-orange-400/30" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                    <BarChart2 className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Analyzing your resume…</p>
              </motion.div>
            ) : !result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Gauge className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Run an analysis to see your ATS report</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Select a resume and optionally paste a job description for a tailored score.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 text-sm"
              >
                <ScoreRing score={result.score} />

                {result.readabilityScore !== undefined && (
                  <div className="space-y-2 rounded-xl border border-border p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score Breakdown</p>
                    <MiniScore label="ATS Score" score={result.score} />
                    <MiniScore label="Readability" score={result.readabilityScore} />
                  </div>
                )}

                {result.summary && (
                  <p className="text-muted-foreground">{result.summary}</p>
                )}

                {result.keywordsFound.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-500" /> Keywords Found
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordsFound.map((k, i) => (
                        <span key={i} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.keywordsMissing.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                      <XCircle className="h-4 w-4 text-red-500" /> Missing Keywords
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywordsMissing.map((k, i) => (
                        <span key={i} className="rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-800 dark:bg-red-950 dark:text-red-300">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(result.weakSections ?? []).length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Weak Sections
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.weakSections ?? []).map((s, i) => (
                        <span key={i} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.suggestions.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                      <Lightbulb className="h-4 w-4 text-purple-500" /> Suggestions
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      {result.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-0.5 shrink-0 text-purple-500">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(result.formattingIssues ?? []).length > 0 && (
                  <div>
                    <p className="mb-2 font-semibold text-foreground">Formatting Issues</p>
                    <ul className="space-y-1.5 text-muted-foreground">
                      {(result.formattingIssues ?? []).map((f, i) => (
                        <li key={i} className="flex gap-2">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
