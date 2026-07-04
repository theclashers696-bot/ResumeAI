"use client";

import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Heart,
  Mic,
  BarChart2,
  GitCompare,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditStatus } from "@/components/ai/credit-status";
import { ResumeHealthAnalyzer } from "@/components/ai/resume-health";
import { CareerIntelligence } from "@/components/ai/career-intelligence";
import { InterviewPrep } from "@/components/ai/interview-prep";
import { SkillGapAnalysis } from "@/components/ai/skill-gap";
import { ResumeComparison } from "@/components/ai/resume-comparison";
import { cn } from "@/lib/utils";

interface CareerTab {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  gradient: string;
  badge?: string;
}

const TABS: CareerTab[] = [
  {
    value: "health",
    label: "Resume Health",
    icon: Heart,
    description: "Deep 7-dimension health analysis with scores, passive voice, buzzwords, and grammar checks",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    value: "career",
    label: "Career Intelligence",
    icon: TrendingUp,
    description: "Career paths, salary data, trending skills, certifications, and a personalized learning roadmap",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    value: "interview",
    label: "Interview Prep",
    icon: Mic,
    description: "AI-generated technical, behavioral, and HR questions with STAR-format suggested answers",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    value: "skill-gap",
    label: "Skill Gap",
    icon: BarChart2,
    description: "Compare your resume to a target role and get a personalized course and roadmap plan",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    value: "compare",
    label: "Comparison",
    icon: GitCompare,
    description: "Compare two resume versions side by side and find out which one is stronger",
    gradient: "from-cyan-500 to-blue-500",
  },
];

function TabButton({ tab, active }: { tab: CareerTab; active: boolean }) {
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
      {tab.badge && (
        <span className="hidden rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary sm:inline">
          {tab.badge}
        </span>
      )}
      {active && (
        <motion.div
          layoutId="career-tab-indicator"
          className={cn("absolute inset-0 -z-10 rounded-xl bg-gradient-to-r opacity-10", tab.gradient)}
        />
      )}
    </TabsTrigger>
  );
}

export default function CareerPage() {
  const [activeTab, setActiveTab] = useState("health");
  const [creditsKey, setCreditsKey] = useState(0);
  const bumpCredits = () => setCreditsKey((k) => k + 1);
  const activeTabMeta = TABS.find((t) => t.value === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Career Intelligence</h1>
          </div>
          {activeTabMeta && (
            <p className="text-muted-foreground flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              {activeTabMeta.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<Skeleton className="h-9 w-24" />}>
            <CreditStatus refreshKey={creditsKey} />
          </Suspense>
        </div>
      </motion.div>

      {/* Feature cards row */}
      <div className="grid gap-3 sm:grid-cols-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
                isActive
                  ? "border-primary/30 bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/20 hover:bg-primary/5"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow transition-transform group-hover:scale-110",
                tab.gradient
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <p className={cn("text-xs font-semibold", isActive ? "text-primary" : "text-foreground")}>{tab.label}</p>
            </button>
          );
        })}
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="sr-only">
          {TABS.map((t) => (
            <TabButton key={t.value} tab={t} active={activeTab === t.value} />
          ))}
        </TabsList>

        <TabsContent value="health" className="mt-0">
          <ResumeHealthAnalyzer onGenerated={bumpCredits} />
        </TabsContent>
        <TabsContent value="career" className="mt-0">
          <CareerIntelligence onGenerated={bumpCredits} />
        </TabsContent>
        <TabsContent value="interview" className="mt-0">
          <InterviewPrep onGenerated={bumpCredits} />
        </TabsContent>
        <TabsContent value="skill-gap" className="mt-0">
          <SkillGapAnalysis onGenerated={bumpCredits} />
        </TabsContent>
        <TabsContent value="compare" className="mt-0">
          <ResumeComparison onGenerated={bumpCredits} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
