"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Copy, Check, User, Briefcase, Code2, GraduationCap, Star, BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { callAI, AIClientError } from "@/lib/ai/client";
import { cn } from "@/lib/utils";

const TONES: { value: string; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { value: "professional", label: "Professional", icon: Briefcase, desc: "Polished, formal tone" },
  { value: "creative", label: "Creative", icon: Star, desc: "Engaging, personality-driven" },
  { value: "executive", label: "Executive", icon: BarChart2, desc: "Senior leadership focus" },
  { value: "student", label: "Student", icon: GraduationCap, desc: "Entry-level, potential-focused" },
  { value: "developer", label: "Developer", icon: Code2, desc: "Technical, skills-forward" },
  { value: "manager", label: "Manager", icon: User, desc: "Leadership & team focus" },
];

export function SummaryGenerator({ onGenerated }: { onGenerated?: () => void }) {
  const [jobTitle, setJobTitle] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [keySkills, setKeySkills] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAI<{ summary: string }>("/api/ai/summary", { jobTitle, yearsOfExperience, keySkills, tone });
      setSummary(data.summary);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof AIClientError ? err.message : "Failed to generate summary.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-purple-200/50 bg-gradient-to-b from-card to-purple-50/20 dark:border-purple-900/30 dark:to-purple-950/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Professional Summary Generator</CardTitle>
              <CardDescription>Generate a compelling 2-4 sentence resume summary.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Job Title *</label>
              <Input placeholder="e.g. Senior Product Manager" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Years of Experience *</label>
              <Input placeholder="e.g. 7" value={yearsOfExperience} onChange={(e) => setYearsOfExperience(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Key Skills *</label>
            <Input placeholder="e.g. Product Strategy, Agile, Data Analysis, Stakeholder Management" value={keySkills} onChange={(e) => setKeySkills(e.target.value)} />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Tone / Style</label>
            <div className="grid gap-2 sm:grid-cols-3">
              {TONES.map((t) => {
                const Icon = t.icon;
                const active = tone === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                      active
                        ? "border-purple-400 bg-purple-50 text-purple-700 dark:border-purple-600 dark:bg-purple-950/40 dark:text-purple-300"
                        : "border-border bg-background text-muted-foreground hover:border-purple-200 hover:bg-purple-50/50 dark:hover:border-purple-800 dark:hover:bg-purple-950/20",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active ? "text-purple-600" : "")} />
                    <div>
                      <p className="font-medium leading-none">{t.label}</p>
                      <p className="mt-0.5 text-[10px] opacity-70">{t.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
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
            onClick={handleGenerate}
            disabled={!jobTitle.trim() || !yearsOfExperience.trim() || !keySkills.trim() || loading}
            isLoading={loading}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Wand2 className="h-4 w-4" />
            Generate Summary
          </Button>

          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="relative rounded-xl border border-purple-200/60 bg-gradient-to-br from-purple-50 to-violet-50 p-4 dark:border-purple-800/40 dark:from-purple-950/30 dark:to-violet-950/20"
              >
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {TONES.find((t) => t.value === tone)?.label} Summary
                </p>
                <p className="text-sm leading-relaxed text-foreground">{summary}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(summary);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground hover:bg-white/60 dark:hover:bg-white/10"
                  aria-label="Copy summary"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
