"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Wand2,
  Star,
  Code2,
  Trophy,
  Mail,
  Gauge,
  Target,
  MessageSquare,
  Clock,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditStatus } from "@/components/ai/credit-status";
import { ResumeGenerator } from "@/components/ai/resume-generator";
import { SummaryGenerator } from "@/components/ai/summary-generator";
import { ExperienceBulletsGenerator, SkillsSuggestGenerator } from "@/components/ai/bullets-skills-generator";
import { CoverLetterGenerator } from "@/components/ai/cover-letter-generator";
import { ATSAnalyzer } from "@/components/ai/ats-analyzer";
import { JobMatchAnalyzer } from "@/components/ai/job-match";
import { ChatAssistant } from "@/components/ai/chat-assistant";
import { AIHistory } from "@/components/ai/ai-history";
import { cn } from "@/lib/utils";

interface AITab {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  gradient: string;
}

const TABS: AITab[] = [
  { value: "resume", label: "Resume", icon: FileText, description: "Generate a complete ATS-optimized resume", gradient: "from-blue-500 to-indigo-500" },
  { value: "summary", label: "Summary", icon: Wand2, description: "Craft a professional summary", gradient: "from-purple-500 to-violet-500" },
  { value: "bullets", label: "Bullets", icon: Star, description: "Write achievement bullet points", gradient: "from-amber-500 to-orange-500" },
  { value: "skills", label: "Skills", icon: Code2, description: "Discover relevant skills", gradient: "from-emerald-500 to-teal-500" },
  { value: "cover-letter", label: "Cover Letter", icon: Mail, description: "Generate tailored cover letters", gradient: "from-pink-500 to-rose-500" },
  { value: "ats", label: "ATS Score", icon: Gauge, description: "Check your ATS compatibility", gradient: "from-orange-500 to-amber-500" },
  { value: "job-match", label: "Job Match", icon: Target, description: "Match resume to job description", gradient: "from-indigo-500 to-blue-500" },
  { value: "achievements", label: "Achievements", icon: Trophy, description: "Generate measurable achievements", gradient: "from-yellow-500 to-orange-500" },
  { value: "chat", label: "AI Chat", icon: MessageSquare, description: "Career coaching & advice", gradient: "from-violet-500 to-purple-500" },
];

function TabButton({ tab, active }: { tab: AITab; active: boolean }) {
  const Icon = tab.icon;
  return (
    <TabsTrigger
      value={tab.value}
      className={cn(
        "relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
        "data-[state=active]:shadow-md",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{tab.label}</span>
      {active && (
        <motion.div
          layoutId="tab-indicator"
          className={cn("absolute inset-0 -z-10 rounded-xl bg-gradient-to-r opacity-10", tab.gradient)}
        />
      )}
    </TabsTrigger>
  );
}

function AchievementsTab({ onGenerated }: { onGenerated: () => void }) {
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/achievement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context }),
      });
      const json = await res.json() as { data?: { achievement: string }; error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setResult(json.data?.achievement ?? "");
      onGenerated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate achievement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-semibold">Achievement Generator</h2>
            <p className="text-sm text-muted-foreground">Turn rough notes into polished, quantified achievements.</p>
          </div>
        </div>

        <div className="space-y-3">
          <textarea
            className="min-h-[120px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g. reduced API response time by fixing caching, improved customer satisfaction, led a team of 5 engineers on a migration project…"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            onClick={handleGenerate}
            disabled={!context.trim() || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50"
          >
            {loading ? (
              <><span className="animate-spin">⟳</span> Generating…</>
            ) : (
              <><Trophy className="h-4 w-4" /> Generate Achievement</>
            )}
          </button>
        </div>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-950/20"
          >
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-400">Result</p>
            <p className="font-medium text-foreground">{result}</p>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="mt-2 text-xs text-yellow-600 underline-offset-2 hover:underline dark:text-yellow-400"
            >
              Copy to clipboard
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState("resume");
  const [creditsKey, setCreditsKey] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const bumpCredits = () => setCreditsKey((k) => k + 1);

  const activeTabMeta = TABS.find((t) => t.value === activeTab);

  return (
    <div className="flex min-h-0 flex-1 gap-6">
      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="mb-1 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">AI Studio</h1>
            </div>
            {activeTabMeta && (
              <p className="text-muted-foreground">{activeTabMeta.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <CreditStatus refreshKey={creditsKey} />
            <button
              onClick={() => setShowHistory((h) => !h)}
              className={cn(
                "flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent",
                showHistory && "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
              )}
            >
              <Clock className="h-4 w-4" />
              History
              <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", showHistory && "rotate-90")} />
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-auto flex-wrap gap-1 rounded-2xl bg-muted/60 p-1.5">
            {TABS.map((t) => (
              <TabButton key={t.value} tab={t} active={activeTab === t.value} />
            ))}
          </TabsList>

          <div className="mt-6">
            <TabsContent value="resume" className="mt-0">
              <ResumeGenerator onGenerated={bumpCredits} />
            </TabsContent>
            <TabsContent value="summary" className="mt-0">
              <SummaryGenerator onGenerated={bumpCredits} />
            </TabsContent>
            <TabsContent value="bullets" className="mt-0">
              <ExperienceBulletsGenerator onGenerated={bumpCredits} />
            </TabsContent>
            <TabsContent value="skills" className="mt-0">
              <SkillsSuggestGenerator onGenerated={bumpCredits} />
            </TabsContent>
            <TabsContent value="cover-letter" className="mt-0">
              <CoverLetterGenerator onGenerated={bumpCredits} />
            </TabsContent>
            <TabsContent value="ats" className="mt-0">
              <ATSAnalyzer onGenerated={bumpCredits} />
            </TabsContent>
            <TabsContent value="job-match" className="mt-0">
              <JobMatchAnalyzer onGenerated={bumpCredits} />
            </TabsContent>
            <TabsContent value="achievements" className="mt-0">
              <AchievementsTab onGenerated={bumpCredits} />
            </TabsContent>
            <TabsContent value="chat" className="mt-0">
              <ChatAssistant onGenerated={bumpCredits} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* History sidebar */}
      {showHistory && (
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="hidden w-80 shrink-0 xl:block"
        >
          <div className="sticky top-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <AIHistory />
            </Suspense>
          </div>
        </motion.aside>
      )}
    </div>
  );
}
