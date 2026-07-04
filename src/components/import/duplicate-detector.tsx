"use client";

import { useMemo } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ParsedResume } from "@/lib/resume-parser";

interface Duplicate {
  type: "skill" | "experience" | "education" | "project";
  label: string;
  indices: number[];
}

function findDuplicates(data: ParsedResume): Duplicate[] {
  const dupes: Duplicate[] = [];

  const seen = new Map<string, number[]>();
  data.skills.forEach((s, i) => {
    const key = s.name.toLowerCase().trim();
    const prev = seen.get(key) ?? [];
    seen.set(key, [...prev, i]);
  });
  seen.forEach((indices, key) => {
    if (indices.length > 1) {
      dupes.push({ type: "skill", label: key, indices });
    }
  });

  const expSeen = new Map<string, number[]>();
  data.workExperiences.forEach((e, i) => {
    const key = `${e.company.toLowerCase()}|${e.position.toLowerCase()}`;
    const prev = expSeen.get(key) ?? [];
    expSeen.set(key, [...prev, i]);
  });
  expSeen.forEach((indices, key) => {
    if (indices.length > 1) {
      const [company, position] = key.split("|");
      dupes.push({
        type: "experience",
        label: `${position} at ${company}`,
        indices,
      });
    }
  });

  const eduSeen = new Map<string, number[]>();
  data.educations.forEach((e, i) => {
    const key = `${e.institution.toLowerCase()}|${e.degree.toLowerCase()}`;
    const prev = eduSeen.get(key) ?? [];
    eduSeen.set(key, [...prev, i]);
  });
  eduSeen.forEach((indices, key) => {
    if (indices.length > 1) {
      const [institution, degree] = key.split("|");
      dupes.push({
        type: "education",
        label: `${degree} at ${institution}`,
        indices,
      });
    }
  });

  const projSeen = new Map<string, number[]>();
  data.projects.forEach((p, i) => {
    const key = p.name.toLowerCase().trim();
    const prev = projSeen.get(key) ?? [];
    projSeen.set(key, [...prev, i]);
  });
  projSeen.forEach((indices, key) => {
    if (indices.length > 1) {
      dupes.push({ type: "project", label: key, indices });
    }
  });

  return dupes;
}

interface DuplicateDetectorProps {
  data: ParsedResume;
  onCleanup: (cleaned: ParsedResume) => void;
}

export function DuplicateDetector({ data, onCleanup }: DuplicateDetectorProps) {
  const duplicates = useMemo(() => findDuplicates(data), [data]);

  if (duplicates.length === 0) return null;

  const handleCleanAll = () => {
    const cleaned: ParsedResume = {
      ...data,
      skills: dedupe(data.skills, (s) => s.name.toLowerCase()),
      workExperiences: dedupe(
        data.workExperiences,
        (e) => `${e.company.toLowerCase()}|${e.position.toLowerCase()}`
      ),
      educations: dedupe(
        data.educations,
        (e) => `${e.institution.toLowerCase()}|${e.degree.toLowerCase()}`
      ),
      projects: dedupe(data.projects, (p) => p.name.toLowerCase()),
    };
    onCleanup(cleaned);
  };

  const typeColor: Record<Duplicate["type"], string> = {
    skill: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    experience: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    education: "bg-green-500/10 text-green-600 dark:text-green-400",
    project: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  };

  return (
    <Card className="border-yellow-500/30 bg-yellow-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-sm">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            {duplicates.length} Duplicate{duplicates.length !== 1 ? "s" : ""} Detected
          </span>
          <Button size="sm" variant="outline" onClick={handleCleanAll} className="gap-1.5 text-xs">
            <Trash2 className="h-3 w-3" />
            Clean All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {duplicates.map((d, i) => (
          <Badge
            key={i}
            className={`capitalize ${typeColor[d.type]}`}
            variant="secondary"
          >
            {d.type}: {d.label} (×{d.indices.length})
          </Badge>
        ))}
      </CardContent>
    </Card>
  );
}

function dedupe<T>(arr: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
