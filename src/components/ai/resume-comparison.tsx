"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, Loader2, Trophy, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyResumes } from "@/hooks/use-my-resumes";
import { cn } from "@/lib/utils";

interface Difference {
  section: string;
  resume1: string;
  resume2: string;
  verdict: string;
  reason: string;
}

interface ComparisonResult {
  resumeId1: string;
  resumeId2: string;
  resume1Score: number;
  resume2Score: number;
  winner: string;
  recommendation: string;
  differences: Difference[];
  improvements: string[];
  resume1Title?: string;
  resume2Title?: string;
  resume1Strengths?: string[];
  resume2Strengths?: string[];
}

export function ResumeComparison({ onGenerated }: { onGenerated?: () => void }) {
  const { resumes, loading: resumesLoading } = useMyResumes();
  const [resumeId1, setResumeId1] = useState("");
  const [resumeId2, setResumeId2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  async function handleCompare() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/resume-comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId1, resumeId2 }),
      });
      const json = await res.json() as { data?: ComparisonResult; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed");
      if (json.data) { setResult(json.data); onGenerated?.(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  }

  const r1Name = result?.resume1Title ?? "Resume 1";
  const r2Name = result?.resume2Title ?? "Resume 2";
  const winner = result?.winner === "resume1" ? r1Name : result?.winner === "resume2" ? r2Name : "Tie";

  const chartData = result ? [
    { name: r1Name.slice(0, 16), score: result.resume1Score, color: result.winner === "resume1" ? "#10b981" : "#94a3b8" },
    { name: r2Name.slice(0, 16), score: result.resume2Score, color: result.winner === "resume2" ? "#10b981" : "#94a3b8" },
  ] : [];

  return (
    <div className="space-y-6">
      <Card className="border-cyan-200/50 bg-gradient-to-b from-card to-cyan-50/20 dark:border-cyan-900/30 dark:to-cyan-950/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow">
              <GitCompare className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Resume Comparison</CardTitle>
              <CardDescription>Compare two versions side by side and get a verdict on which is stronger.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Resume A</label>
              <select
                value={resumeId1}
                onChange={(e) => setResumeId1(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{resumesLoading ? "Loading…" : "Select resume A"}</option>
                {resumes.filter((r) => r.id !== resumeId2).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Resume B</label>
              <select
                value={resumeId2}
                onChange={(e) => setResumeId2(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{resumesLoading ? "Loading…" : "Select resume B"}</option>
                {resumes.filter((r) => r.id !== resumeId1).map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleCompare}
            disabled={!resumeId1 || !resumeId2 || loading}
            className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Comparing resumes…</> : <><GitCompare className="h-4 w-4" /> Compare Resumes</>}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div key="comparison-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Verdict banner */}
            <Card className={cn(
              "border-2",
              result.winner === "tie" ? "border-amber-300 dark:border-amber-700" : "border-emerald-300 dark:border-emerald-700"
            )}>
              <CardContent className="pt-6 pb-6 text-center">
                <Trophy className={cn("mx-auto mb-2 h-8 w-8", result.winner === "tie" ? "text-amber-500" : "text-emerald-500")} />
                <p className="text-2xl font-bold mb-1">
                  {result.winner === "tie" ? "It&apos;s a Tie!" : `${winner} Wins`}
                </p>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto">{result.recommendation}</p>
              </CardContent>
            </Card>

            {/* Score comparison */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Score Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v}/100`, "Score"]} />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Strengths */}
              <Card>
                <CardContent className="pt-4 space-y-4">
                  {result.resume1Strengths && result.resume1Strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{r1Name} strengths</p>
                      {result.resume1Strengths.map((s, i) => (
                        <p key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                          <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {s}
                        </p>
                      ))}
                    </div>
                  )}
                  {result.resume2Strengths && result.resume2Strengths.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{r2Name} strengths</p>
                      {result.resume2Strengths.map((s, i) => (
                        <p key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                          <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" /> {s}
                        </p>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Section-by-section differences */}
            {(result.differences as Difference[]).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Section-by-Section Comparison</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(result.differences as Difference[]).map((diff, i) => (
                    <div key={i} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-sm">{diff.section}</p>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          diff.verdict === "resume1_better" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" :
                          diff.verdict === "resume2_better" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {diff.verdict === "resume1_better" ? `${r1Name} better` : diff.verdict === "resume2_better" ? `${r2Name} better` : "Equal"}
                        </span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">{r1Name}</p>
                          <p className="text-foreground">{diff.resume1}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:contents">
                          <ArrowRight className="hidden sm:block h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">{r2Name}</p>
                            <p className="text-foreground">{diff.resume2}</p>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{diff.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Improvements */}
            {(result.improvements as string[]).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recommended Improvements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(result.improvements as string[]).map((imp, i) => (
                    <p key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-500" /> {imp}
                    </p>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
