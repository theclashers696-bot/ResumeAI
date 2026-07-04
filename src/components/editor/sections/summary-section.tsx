"use client";

import { memo, useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import { SectionCard, SectionHeader } from "@/components/editor/section-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AI_SUGGESTIONS = [
  "Results-driven software engineer with 5+ years of experience building scalable web applications using React, Node.js, and cloud infrastructure.",
  "Creative product designer with a passion for user-centered design and a track record of shipping delightful digital experiences.",
  "Data scientist experienced in machine learning, statistical modeling, and transforming complex datasets into actionable business insights.",
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const SummarySection = memo(function SummarySection({ value, onChange }: Props) {
  const [charCount, setCharCount] = useState(value.length);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const MAX = 1000;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={FileText}
        title="Professional Summary"
        description="A brief overview of your professional background and key strengths"
      />

      <SectionCard>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground" htmlFor="summary-textarea">
              Summary
            </label>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs", charCount > MAX * 0.9 ? "text-destructive" : "text-muted-foreground")}>
                {charCount}/{MAX}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                <Sparkles className="h-3 w-3" />
                AI Suggestions
              </Button>
            </div>
          </div>

          <textarea
            id="summary-textarea"
            value={value}
            onChange={(e) => {
              if (e.target.value.length <= MAX) {
                onChange(e.target.value);
                setCharCount(e.target.value.length);
              }
            }}
            placeholder="Write 2–4 sentences highlighting your experience, key skills, and career goals. Focus on what makes you unique..."
            className="min-h-[140px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Professional summary"
          />

          {showSuggestions && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Click to use a suggestion:</p>
              {AI_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onChange(s);
                    setCharCount(s.length);
                    setShowSuggestions(false);
                  }}
                  className="w-full rounded-md border border-border bg-background p-2.5 text-left text-xs text-foreground hover:bg-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">✨ Writing Tips</p>
            <ul className="mt-1 space-y-0.5 text-xs text-blue-600 dark:text-blue-400">
              <li>• Keep it to 2–4 sentences (50–150 words)</li>
              <li>• Start with your title/years of experience</li>
              <li>• Include 2–3 key skills or achievements</li>
              <li>• End with your career goal or value proposition</li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  );
});
