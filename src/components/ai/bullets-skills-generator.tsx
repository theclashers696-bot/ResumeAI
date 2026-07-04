"use client";

import { useState } from "react";
import { Wand2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { callAI, AIClientError } from "@/lib/ai/client";

export function ExperienceBulletsGenerator({ onGenerated }: { onGenerated?: () => void }) {
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bullets, setBullets] = useState<string[]>([]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAI<{ bullets: string[] }>("/api/ai/experience-bullets", {
        position,
        company,
        description,
        count: 4,
      });
      setBullets(data.bullets);
      onGenerated?.();
    } catch (err) {
      setError(err instanceof AIClientError ? err.message : "Failed to generate bullets.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Experience Bullet Points</CardTitle>
        <CardDescription>Turn a role into strong, quantified achievement bullets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="Position (e.g. Software Engineer)" value={position} onChange={(e) => setPosition(e.target.value)} />
          <Input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <Textarea placeholder="What did you actually do in this role?" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          onClick={handleGenerate}
          disabled={!position.trim() || !company.trim() || loading}
          isLoading={loading}
          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Wand2 className="h-4 w-4" />
          Generate Bullets
        </Button>
        {bullets.length > 0 && (
          <ul className="space-y-2 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-0.5 text-purple-500">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function SkillsSuggestGenerator({ onGenerated }: { onGenerated?: () => void }) {
  const [jobTitle, setJobTitle] = useState("");
  const [existingSkills, setExistingSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [added, setAdded] = useState<Set<string>>(new Set());

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAI<{ skills: string[] }>("/api/ai/skills-suggest", { jobTitle, existingSkills });
      setSkills(data.skills);
      setAdded(new Set());
      onGenerated?.();
    } catch (err) {
      setError(err instanceof AIClientError ? err.message : "Failed to suggest skills.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Skill Suggestions</CardTitle>
        <CardDescription>Get relevant skills to strengthen your resume.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Job title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        <Input placeholder="Existing skills, comma separated (optional)" value={existingSkills} onChange={(e) => setExistingSkills(e.target.value)} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          onClick={handleGenerate}
          disabled={!jobTitle.trim() || loading}
          isLoading={loading}
          className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Wand2 className="h-4 w-4" />
          Suggest Skills
        </Button>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <button
                key={s}
                onClick={() => setAdded((prev) => new Set(prev).add(s))}
                className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:bg-accent"
              >
                {added.has(s) ? <span className="text-emerald-600">✓</span> : <Plus className="h-3 w-3" />}
                {s}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
