"use client";

import { useState } from "react";
import { Wand2, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { callAI, AIClientError } from "@/lib/ai/client";

const TONES = ["professional", "enthusiastic", "confident", "formal"];

interface CoverLetter {
  id: string;
  content: string;
}

export function CoverLetterGenerator({ onGenerated }: { onGenerated?: () => void }) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateSummary, setCandidateSummary] = useState("");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAI<CoverLetter>("/api/ai/cover-letter", {
        jobTitle,
        company,
        jobDescription,
        candidateSummary,
        tone,
      });
      setLetter(data);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof AIClientError ? err.message : "Failed to generate cover letter.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cover Letter</CardTitle>
          <CardDescription>Generate a tailored cover letter for a specific job.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {TONES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Textarea placeholder="Paste the job description (optional but improves results)" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={4} />
          <Textarea placeholder="A few notes about your background (optional)" value={candidateSummary} onChange={(e) => setCandidateSummary(e.target.value)} rows={3} />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            onClick={handleGenerate}
            disabled={!jobTitle.trim() || !company.trim() || loading}
            isLoading={loading}
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Wand2 className="h-4 w-4" />
            Generate Cover Letter
          </Button>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Result</CardTitle>
            <CardDescription>Ready to send, personalize as needed.</CardDescription>
          </div>
          {letter && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(letter.content);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="gap-2"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {!letter ? (
            <div className="flex h-full min-h-[220px] items-center justify-center text-center text-sm text-muted-foreground">
              Your generated cover letter will appear here.
            </div>
          ) : (
            <p className="whitespace-pre-line text-sm leading-relaxed">{letter.content}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
