"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart2, Loader2, AlertCircle, BookOpen, ChevronRight, GraduationCap } from "lucide-react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMyResumes } from "@/hooks/use-my-resumes";
import { cn } from "@/lib/utils";

interface MissingSkill { skill: string; priority: string; reason: string }
interface Course { title: string; provider: string; duration: string; level: string; focus: string }
interface RoadmapStep { step: number; milestone: string; description: string; timeframe: string; skills: string[] }

interface GapResult {
  targetRole: string;
  matchScore: number;
  currentLevel?: string;
  summary?: string;
  missingSkills: MissingSkill[];
  courses: Course[];
  roadmap: RoadmapStep[];
}

const PRIORITY_CONFIG: Record<string, { color: string; bar: string }> = {
  High: { color: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300", bar: "bg-red-500" },
  Medium: { color: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300", bar: "bg-amber-500" },
  Low: { color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300", bar: "bg-emerald-500" },
};

const LEVEL_COLORS: Record<string, string> = {
  Beginner: "text-emerald-600 dark:text-emerald-400",
  Intermediate: "text-amber-600 dark:text-amber-400",
  Advanced: "text-red-600 dark:text-red-400",
};

const PROVIDERS: Record<string, string> = {
  Coursera: "🎓",
  Udemy: "🟣",
  "LinkedIn Learning": "🔵",
  edX: "🔴",
  Pluralsight: "🟠",
};

export function SkillGapAnalysis({ onGenerated }: { onGenerated?: () => void }) {
  const { resumes, loading: resumesLoading } = useMyResumes();
  const [resumeId, setResumeId] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GapResult | null>(null);
  const [activeTab, setActiveTab] = useState<"skills" | "courses" | "roadmap">("skills");

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, targetRole }),
      });
      const json = await res.json() as { data?: GapResult; error?: string };
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed");
      if (json.data) { setResult(json.data); onGenerated?.(); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  const radialData = result ? [{ name: "Match", value: result.matchScore, fill: result.matchScore >= 70 ? "#10b981" : result.matchScore >= 40 ? "#f59e0b" : "#ef4444" }] : [];

  return (
    <div className="space-y-6">
      <Card className="border-teal-200/50 bg-gradient-to-b from-card to-teal-50/20 dark:border-teal-900/30 dark:to-teal-950/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow">
              <BarChart2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Skill Gap Analysis</CardTitle>
              <CardDescription>Compare your resume to a target role and get a personalized learning roadmap.</CardDescription>
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
            placeholder="Target role (e.g. Machine Learning Engineer)"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
          />
          {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleAnalyze}
            disabled={!resumeId || !targetRole.trim() || loading}
            className="w-full gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing gaps…</> : <><BarChart2 className="h-4 w-4" /> Analyze Skill Gap</>}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div key="gap-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Match score */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardContent className="pt-4 flex flex-col items-center">
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart innerRadius={45} outerRadius={70} data={radialData} startAngle={90} endAngle={90 - 360 * (result.matchScore / 100)}>
                        <RadialBar dataKey="value" cornerRadius={8} />
                        <Tooltip formatter={(v: number) => [`${v}%`, "Match"]} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center -mt-4">
                    <p className="text-4xl font-bold tabular-nums">{result.matchScore}%</p>
                    <p className="text-sm text-muted-foreground">Skill Match</p>
                    {result.currentLevel && <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">{result.currentLevel}</p>}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <p className="font-medium text-sm">Gap Summary</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{result.summary ?? `You have ${result.matchScore}% of skills required for ${result.targetRole}.`}</p>
                  <div className="space-y-1.5">
                    {(["High", "Medium", "Low"] as const).map((priority) => {
                      const count = (result.missingSkills as MissingSkill[]).filter((s) => s.priority === priority).length;
                      if (count === 0) return null;
                      return (
                        <div key={priority} className="flex items-center justify-between text-xs">
                          <span className={cn("rounded-full px-2 py-0.5", PRIORITY_CONFIG[priority].color)}>{priority} priority</span>
                          <span className="font-medium">{count} skill{count !== 1 ? "s" : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              {(["skills", "courses", "roadmap"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-xs font-medium capitalize transition-all",
                    activeTab === tab ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab === "skills" ? "Missing Skills" : tab === "courses" ? "Courses" : "Roadmap"}
                </button>
              ))}
            </div>

            {activeTab === "skills" && (
              <div className="space-y-3">
                {(result.missingSkills as MissingSkill[]).map((skill, i) => (
                  <div key={i} className="rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-sm">{skill.skill}</p>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-medium", PRIORITY_CONFIG[skill.priority]?.color ?? "")}>
                        {skill.priority}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{skill.reason}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn("h-full rounded-full", PRIORITY_CONFIG[skill.priority]?.bar ?? "bg-gray-400")} style={{ width: skill.priority === "High" ? "90%" : skill.priority === "Medium" ? "55%" : "25%" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "courses" && (
              <div className="space-y-3">
                {(result.courses as Course[]).map((course, i) => (
                  <Card key={i}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/30 text-xl">
                          {PROVIDERS[course.provider] ?? <GraduationCap className="h-5 w-5 text-teal-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{course.title}</p>
                          <p className="text-xs text-muted-foreground">{course.provider} · {course.duration}</p>
                          <p className="text-sm text-muted-foreground mt-1">{course.focus}</p>
                          <span className={cn("mt-1 inline-block text-xs font-medium", LEVEL_COLORS[course.level] ?? "text-muted-foreground")}>{course.level}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "roadmap" && (
              <div className="relative space-y-0">
                {(result.roadmap as RoadmapStep[]).map((step, i) => (
                  <div key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < result.roadmap.length - 1 && <div className="absolute left-4 top-9 bottom-0 w-px bg-border" />}
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-sm font-bold shadow">
                      {step.step}
                    </div>
                    <Card className="flex-1">
                      <CardContent className="pt-3 pb-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm">{step.milestone}</p>
                          <span className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground"><ChevronRight className="h-3 w-3" />{step.timeframe}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {step.skills.map((s, j) => (
                            <span key={j} className="rounded-full bg-teal-50 dark:bg-teal-950/30 px-2 py-0.5 text-xs text-teal-700 dark:text-teal-300">{s}</span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">You&apos;ve got this! 🎉</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
