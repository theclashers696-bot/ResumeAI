"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle, XCircle, Lightbulb, TrendingUp, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMyResumes } from "@/hooks/use-my-resumes";
import { callAI, AIClientError } from "@/lib/ai/client";
import { cn } from "@/lib/utils";

interface JobMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  keywordGap?: string[];
  strengthAreas?: string[];
}

function MatchScore({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  const bg = score >= 80 ? "from-emerald-500 to-teal-500" : score >= 60 ? "from-amber-500 to-orange-500" : "from-red-500 to-rose-500";
  const label = score >= 80 ? "Great Match" : score >= 60 ? "Moderate Match" : score >= 40 ? "Weak Match" : "Poor Match";

  return (
    <div className="flex items-center gap-5">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
          <motion.circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="url(#matchGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 32}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - score / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"} />
              <stop offset="100%" stopColor={score >= 80 ? "#14b8a6" : score >= 60 ? "#f97316" : "#f43f5e"} />
            </linearGradient>
          </defs>
        </svg>
        <span className={cn("text-xl font-bold tabular-nums", color)}>{score}%</span>
      </div>
      <div>
        <p className={cn("text-xl font-bold", color)}>{label}</p>
        <p className="text-sm text-muted-foreground">Resume vs Job Description</p>
        <div className={cn("mt-1.5 h-1.5 w-full rounded-full bg-gradient-to-r", bg)} style={{ width: `${score}%`, maxWidth: "160px" }} />
      </div>
    </div>
  );
}

export function JobMatchAnalyzer({ onGenerated }: { onGenerated?: () => void }) {
  const { resumes, loading: resumesLoading } = useMyResumes();
  const [resumeId, setResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobMatchResult | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAI<JobMatchResult>("/api/ai/job-match", { resumeId, jobTitle, company, jobDescription });
      setResult(data);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof AIClientError ? err.message : "Failed to match job.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-indigo-200/50 bg-gradient-to-b from-card to-indigo-50/20 dark:border-indigo-900/30 dark:to-indigo-950/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Job Description Matcher</CardTitle>
              <CardDescription>See how well your resume matches a specific opening.</CardDescription>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Job Title *</label>
              <Input placeholder="e.g. Senior Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Company (optional)</label>
              <Input placeholder="e.g. Stripe" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Job Description *</label>
            <Textarea
              placeholder="Paste the full job description here…"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
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
            disabled={!resumeId || !jobTitle.trim() || jobDescription.trim().length < 20 || loading}
            isLoading={loading}
            className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
          >
            <Target className="h-4 w-4" />
            {loading ? "Matching…" : "Match Resume"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match Report</CardTitle>
          <CardDescription>Where you stand and how to close the gap.</CardDescription>
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
                  <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Comparing resume to job description…</p>
              </motion.div>
            ) : !result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Run a match to see your report</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Paste a job description to get an instant compatibility score.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5 text-sm"
              >
                <MatchScore score={result.matchScore} />

                {(result.strengthAreas ?? []).length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                      <TrendingUp className="h-4 w-4 text-emerald-500" /> Strength Areas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.strengthAreas ?? []).map((s, i) => (
                        <span key={i} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.matchedSkills.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                      <CheckCircle className="h-4 w-4 text-emerald-500" /> Matched Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchedSkills.map((s, i) => (
                        <span key={i} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.missingSkills.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                      <XCircle className="h-4 w-4 text-red-500" /> Missing Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingSkills.map((s, i) => (
                        <span key={i} className="rounded-full bg-red-100 px-2.5 py-1 text-xs text-red-800 dark:bg-red-950 dark:text-red-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(result.keywordGap ?? []).length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                      <Zap className="h-4 w-4 text-amber-500" /> High-Priority Keyword Gap
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(result.keywordGap ?? []).map((k, i) => (
                        <span key={i} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.recommendations.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 font-semibold text-foreground">
                      <Lightbulb className="h-4 w-4 text-purple-500" /> Recommendations
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      {result.recommendations.map((r, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-0.5 shrink-0 text-purple-500">•</span>
                          {r}
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
