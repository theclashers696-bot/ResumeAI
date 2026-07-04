"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, DollarSign, Star, Award, Map, Loader2, Briefcase, ChevronRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMyResumes } from "@/hooks/use-my-resumes";
import { cn } from "@/lib/utils";

interface CareerPath {
  title: string;
  description: string;
  salaryRange: { min: number; max: number; currency: string };
  yearsToAchieve: string;
  requiredSkills: string[];
  difficulty: string;
}

interface CareerResult {
  currentRole?: string;
  experienceLevel?: string;
  careerPaths: CareerPath[];
  salaryRange: { min: number; max: number; currency: string; level: string };
  popularSkills: string[];
  trendingTech: string[];
  certifications: Array<{ name: string; provider: string; priority: string; reason: string }>;
  learningRoadmap: Array<{ step: number; title: string; description: string; timeframe: string; skills: string[] }>;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  Hard: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  High: "text-red-600 dark:text-red-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Low: "text-emerald-600 dark:text-emerald-400",
};

function fmt(n: number) { return `$${(n / 1000).toFixed(0)}k`; }

export function CareerIntelligence({ onGenerated }: { onGenerated?: () => void }) {
  const { resumes, loading: resumesLoading } = useMyResumes();
  const [resumeId, setResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CareerResult | null>(null);
  const [activeTab, setActiveTab] = useState<"paths" | "skills" | "certs" | "roadmap">("paths");

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/career-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      const json = await res.json() as { data?: CareerResult; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed");
      if (json.data) { setResult(json.data); onGenerated?.(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate career intelligence.");
    } finally {
      setLoading(false);
    }
  }

  const salaryChartData = result?.careerPaths.map((p) => ({
    name: p.title.split(" ").slice(0, 2).join(" "),
    min: p.salaryRange.min / 1000,
    max: p.salaryRange.max / 1000,
  })) ?? [];

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200/50 bg-gradient-to-b from-card to-indigo-50/20 dark:border-indigo-900/30 dark:to-indigo-950/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Career Intelligence</CardTitle>
              <CardDescription>Career paths, salary data, trending skills, and a learning roadmap.</CardDescription>
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
            onClick={handleGenerate}
            disabled={!resumeId || loading}
            className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing career…</> : <><TrendingUp className="h-4 w-4" /> Generate Career Report</>}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div key="career-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <DollarSign className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
                  <p className="text-2xl font-bold">{fmt(result.salaryRange.min)}–{fmt(result.salaryRange.max)}</p>
                  <p className="text-xs text-muted-foreground">Current salary range</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Map className="mx-auto mb-1 h-5 w-5 text-indigo-500" />
                  <p className="text-2xl font-bold">{result.careerPaths.length}</p>
                  <p className="text-xs text-muted-foreground">Career paths</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Star className="mx-auto mb-1 h-5 w-5 text-amber-500" />
                  <p className="text-2xl font-bold">{result.popularSkills.length}</p>
                  <p className="text-xs text-muted-foreground">In-demand skills</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Award className="mx-auto mb-1 h-5 w-5 text-rose-500" />
                  <p className="text-2xl font-bold">{result.certifications.length}</p>
                  <p className="text-xs text-muted-foreground">Certifications</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {(["paths", "skills", "certs", "roadmap"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-xs font-medium capitalize transition-all",
                    activeTab === tab ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "paths" ? "Career Paths" : tab === "skills" ? "Skills & Tech" : tab === "certs" ? "Certifications" : "Roadmap"}
                </button>
              ))}
            </div>

            {/* Career Paths */}
            {activeTab === "paths" && (
              <div className="space-y-4">
                {/* Salary comparison chart */}
                {salaryChartData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Salary Ranges by Path (USD $k)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={salaryChartData} layout="vertical">
                          <XAxis type="number" tick={{ fontSize: 10 }} />
                          <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                          <Tooltip formatter={(v: number) => [`$${v}k`, ""]} />
                          <Bar dataKey="min" fill="#818cf8" radius={[0, 0, 0, 4]} />
                          <Bar dataKey="max" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.careerPaths.map((path, i) => (
                    <Card key={i} className="border-indigo-100 dark:border-indigo-900/30">
                      <CardContent className="pt-4">
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/40">
                              <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{path.title}</p>
                              <p className="text-xs text-muted-foreground">{path.yearsToAchieve}</p>
                            </div>
                          </div>
                          <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", DIFFICULTY_COLORS[path.difficulty] ?? DIFFICULTY_COLORS.Medium)}>
                            {path.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
                        <p className="mb-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {fmt(path.salaryRange.min)} – {fmt(path.salaryRange.max)} / year
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {path.requiredSkills.slice(0, 4).map((s, j) => (
                            <span key={j} className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 text-xs text-indigo-700 dark:text-indigo-300">{s}</span>
                          ))}
                          {path.requiredSkills.length > 4 && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">+{path.requiredSkills.length - 4}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Skills & Tech */}
            {activeTab === "skills" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-amber-500" /> In-Demand Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.popularSkills.map((s, i) => (
                        <span key={i} className="rounded-full bg-amber-50 dark:bg-amber-950/30 px-3 py-1 text-sm text-amber-800 dark:text-amber-300">{s}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-500" /> Trending Technologies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.trendingTech.map((t, i) => (
                        <span key={i} className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 text-sm text-indigo-800 dark:text-indigo-300">{t}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Certifications */}
            {activeTab === "certs" && (
              <div className="space-y-3">
                {result.certifications.map((cert, i) => (
                  <Card key={i}>
                    <CardContent className="flex items-start gap-4 pt-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30">
                        <Award className="h-5 w-5 text-rose-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm">{cert.name}</p>
                          <span className={cn("shrink-0 text-xs font-medium", PRIORITY_COLORS[cert.priority] ?? "")}>{cert.priority} priority</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{cert.provider}</p>
                        <p className="text-sm text-muted-foreground mt-1">{cert.reason}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Roadmap */}
            {activeTab === "roadmap" && (
              <div className="relative space-y-0">
                {result.learningRoadmap.map((step, i) => (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < result.learningRoadmap.length - 1 && (
                      <div className="absolute left-4 top-9 bottom-0 w-px bg-border" />
                    )}
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold shadow">
                      {step.step}
                    </div>
                    <Card className="flex-1 border-indigo-100 dark:border-indigo-900/30">
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm">{step.title}</p>
                          <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-1"><ChevronRight className="h-3 w-3" />{step.timeframe}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {step.skills.map((s, j) => (
                            <span key={j} className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 text-xs text-indigo-700 dark:text-indigo-300">{s}</span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
