"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wand2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building2,
  MapPin,
  GraduationCap,
  Briefcase,
  Code2,
  Trophy,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { callAI, AIClientError } from "@/lib/ai/client";
import { cn } from "@/lib/utils";
import type { GeneratedResume } from "@/app/api/ai/resume/route";

interface PopulateResult {
  resumeId: string;
  title: string;
}

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Singapore", "India", "UAE", "Remote",
];

const EXPERIENCE_LEVELS = [
  "0-1 (Entry level)", "1-3", "3-5", "5-8", "8-12", "12+ (Senior / Executive)",
];

function SectionCollapse({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-accent/50"
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultPanel({ result, onPopulate }: { result: GeneratedResume; onPopulate?: (r: GeneratedResume) => void }) {
  const [copied, setCopied] = useState(false);
  const [populating, setPopulating] = useState(false);
  const [populateResult, setPopulateResult] = useState<PopulateResult | null>(null);
  const [populateError, setPopulateError] = useState<string | null>(null);

  function handleCopy() {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handlePopulate() {
    setPopulating(true);
    setPopulateError(null);
    try {
      const res = await fetch("/api/ai/resume/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "AI Generated Resume",
          summary: result.summary,
          workExperiences: result.workExperiences,
          educations: result.educations ?? [],
          skills: result.skills,
          projects: result.projects,
          certifications: result.certifications ?? [],
          achievements: result.achievements ?? [],
        }),
      });
      const json = await res.json() as { data?: { id: string; title: string }; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to create resume");
      const resumeId = json.data?.id ?? "";
      const title = json.data?.title ?? "AI Generated";
      setPopulateResult({ resumeId, title });
      onPopulate?.(result);
    } catch (err) {
      setPopulateError(err instanceof Error ? err.message : "Failed to populate resume builder.");
    } finally {
      setPopulating(false);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy JSON"}
        </Button>
        {!populateResult && (
          <Button
            size="sm"
            onClick={handlePopulate}
            disabled={populating}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {populating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {populating ? "Saving to Resume Builder…" : "Send to Resume Builder"}
          </Button>
        )}
        {populateResult && (
          <a
            href={`/resumes/${populateResult.resumeId}/edit`}
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open in Editor
          </a>
        )}
      </div>
      {populateError && <p className="text-xs text-destructive">{populateError}</p>}

      <div className="space-y-3">
        <div className="rounded-lg bg-purple-50 p-3 dark:bg-purple-950/30">
          <p className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
            <FileText className="h-4 w-4 text-purple-500" /> Summary
          </p>
          <p className="text-muted-foreground">{result.summary}</p>
        </div>

        <SectionCollapse title={`Experience (${result.workExperiences.length})`} defaultOpen>
          <div className="space-y-3">
            {result.workExperiences.map((w, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <p className="font-medium">{w.position} · {w.company}</p>
                <p className="text-xs text-muted-foreground">{w.location} · {w.startDate} – {w.current ? "Present" : w.endDate}</p>
                <p className="mt-1.5 text-muted-foreground">{w.description}</p>
                {w.achievements.length > 0 && (
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {w.achievements.map((a, j) => (
                      <li key={j} className="flex gap-2"><span className="mt-0.5 text-purple-500 shrink-0">•</span><span>{a}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </SectionCollapse>

        {(result.educations ?? []).length > 0 && (
          <SectionCollapse title={`Education (${(result.educations ?? []).length})`}>
            <div className="space-y-2">
              {(result.educations ?? []).map((e, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{e.degree} in {e.fieldOfStudy}</p>
                  <p className="text-xs text-muted-foreground">{e.institution} · {e.startDate} – {e.endDate}</p>
                </div>
              ))}
            </div>
          </SectionCollapse>
        )}

        <SectionCollapse title={`Skills (${result.skills.length})`}>
          <div className="flex flex-wrap gap-1.5">
            {result.skills.map((s, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{s.name}</Badge>
            ))}
          </div>
        </SectionCollapse>

        {result.projects.length > 0 && (
          <SectionCollapse title={`Projects (${result.projects.length})`}>
            <div className="space-y-2">
              {result.projects.map((p, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-muted-foreground">{p.description}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.technologies.map((t, j) => (
                      <span key={j} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCollapse>
        )}

        {(result.certifications ?? []).length > 0 && (
          <SectionCollapse title={`Certifications (${(result.certifications ?? []).length})`}>
            <div className="space-y-1.5">
              {(result.certifications ?? []).map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.issuer} · {c.issueDate}</span>
                </div>
              ))}
            </div>
          </SectionCollapse>
        )}

        {(result.achievements ?? []).length > 0 && (
          <SectionCollapse title={`Achievements (${(result.achievements ?? []).length})`}>
            <div className="space-y-1.5">
              {(result.achievements ?? []).map((a, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <p className="font-medium">{a.title}</p>
                  {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                </div>
              ))}
            </div>
          </SectionCollapse>
        )}
      </div>
    </div>
  );
}

export function ResumeGenerator({ onGenerated }: { onGenerated?: () => void }) {
  const [jobTitle, setJobTitle] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [education, setEducation] = useState("");
  const [keySkills, setKeySkills] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [country, setCountry] = useState("");
  const [background, setBackground] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResume | null>(null);

  const canSubmit = jobTitle.trim() && yearsOfExperience.trim() && keySkills.trim() && !loading;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAI<GeneratedResume>("/api/ai/resume", {
        jobTitle,
        yearsOfExperience,
        education,
        keySkills,
        targetCompany,
        country,
        background,
      });
      setResult(data);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof AIClientError ? err.message : "Failed to generate resume.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* Form */}
      <Card className="border-purple-200/50 bg-gradient-to-b from-card to-purple-50/20 dark:border-purple-900/30 dark:from-card dark:to-purple-950/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow">
              <Wand2 className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Resume Generator</CardTitle>
              <CardDescription>Complete ATS-optimized resume in seconds.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" /> Job Title *
              </label>
              <Input
                placeholder="e.g. Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Trophy className="h-3.5 w-3.5" /> Years of Experience *
              </label>
              <select
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !yearsOfExperience && "text-muted-foreground",
                )}
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_LEVELS.map((l) => (
                  <option key={l} value={l}>{l} years</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <GraduationCap className="h-3.5 w-3.5" /> Education
            </label>
            <Input
              placeholder="e.g. B.Sc. Computer Science, MIT"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Code2 className="h-3.5 w-3.5" /> Key Skills *
            </label>
            <Input
              placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
              value={keySkills}
              onChange={(e) => setKeySkills(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" /> Target Company
              </label>
              <Input
                placeholder="e.g. Google, Startup, Fintech"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Country / Market
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !country && "text-muted-foreground",
                )}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Additional Background (optional)</label>
            <Textarea
              placeholder="Any extra context: past achievements, career goals, specific companies, niche skills…"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              rows={4}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </motion.p>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating complete resume…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Full Resume
              </>
            )}
          </Button>

          {loading && (
            <p className="text-center text-xs text-muted-foreground">
              This may take 15–30 seconds. Gemini is crafting your complete resume…
            </p>
          )}
        </CardContent>
      </Card>

      {/* Result panel */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Generated Resume</CardTitle>
          <CardDescription>Review, copy, or send directly to your Resume Builder.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
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
                  <div className="absolute inset-0 animate-ping rounded-full bg-purple-400/30" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                    <Sparkles className="h-6 w-6" />
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-semibold">Generating your resume…</p>
                  <p className="text-sm text-muted-foreground">Writing experience, skills, projects & more</p>
                </div>
                <div className="w-full max-w-xs space-y-2">
                  {["Crafting summary…", "Writing experience bullets…", "Suggesting skills…", "Optimizing for ATS…"].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.5 }}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                      {step}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : !result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Your resume will appear here</p>
                <p className="max-w-xs text-sm text-muted-foreground">
                  Fill in the form and hit Generate. You can then send it directly to the Resume Builder with one click.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ResultPanel result={result} onPopulate={onGenerated} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
