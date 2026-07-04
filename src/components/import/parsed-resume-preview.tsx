"use client";

import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Globe,
  Star,
  Trophy,
  Languages,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ParsedResume } from "@/lib/resume-parser";

interface ParsedResumePreviewProps {
  data: ParsedResume;
}

function Section({
  icon: Icon,
  title,
  children,
  count,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  count?: number;
}) {
  if (count === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {count !== undefined && (
          <Badge variant="secondary" className="ml-auto text-xs">
            {count}
          </Badge>
        )}
      </div>
      <div className="space-y-2 pl-6">{children}</div>
    </div>
  );
}

export function ParsedResumePreview({ data }: ParsedResumePreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Personal Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          {data.fullName && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">Name</span>
              <span className="font-medium">{data.fullName}</span>
            </div>
          )}
          {data.headline && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">Headline</span>
              <span>{data.headline}</span>
            </div>
          )}
          {data.email && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">Email</span>
              <span>{data.email}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">Phone</span>
              <span>{data.phone}</span>
            </div>
          )}
          {data.location && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">Location</span>
              <span>{data.location}</span>
            </div>
          )}
          {data.linkedin && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">LinkedIn</span>
              <span className="truncate">{data.linkedin}</span>
            </div>
          )}
          {data.github && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">GitHub</span>
              <span className="truncate">{data.github}</span>
            </div>
          )}
          {data.website && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-muted-foreground">Website</span>
              <span className="truncate">{data.website}</span>
            </div>
          )}
          {!data.fullName && !data.email && !data.phone && (
            <p className="text-muted-foreground italic">No personal info detected</p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {data.summary && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{data.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <Card>
        <CardContent className="space-y-5 pt-4">
          <Section
            icon={Briefcase}
            title="Work Experience"
            count={data.workExperiences.length}
          >
            {data.workExperiences.map((exp, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="font-medium text-foreground">{exp.position}</p>
                <p className="text-xs text-muted-foreground">
                  {exp.company}
                  {exp.location ? ` · ${exp.location}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {exp.startDate} – {exp.current ? "Present" : (exp.endDate ?? "?")}
                </p>
              </div>
            ))}
          </Section>

          <Section
            icon={GraduationCap}
            title="Education"
            count={data.educations.length}
          >
            {data.educations.map((edu, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="font-medium text-foreground">{edu.degree}</p>
                <p className="text-xs text-muted-foreground">{edu.institution}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {edu.startDate} – {edu.current ? "Present" : (edu.endDate ?? "?")}
                </p>
              </div>
            ))}
          </Section>

          <Section icon={Wrench} title="Skills" count={data.skills.length}>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {s.name}
                </Badge>
              ))}
            </div>
          </Section>

          <Section icon={FolderGit2} title="Projects" count={data.projects.length}>
            {data.projects.map((p, i) => (
              <div key={i} className="rounded-lg border border-border/50 bg-muted/30 p-3">
                <p className="font-medium text-foreground">{p.name}</p>
                {p.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                    {p.description}
                  </p>
                )}
              </div>
            ))}
          </Section>

          <Section icon={Award} title="Certifications" count={data.certifications.length}>
            {data.certifications.map((c, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground"> · {c.issuer}</span>
              </div>
            ))}
          </Section>

          <Section icon={Languages} title="Languages" count={data.languages.length}>
            <div className="flex flex-wrap gap-1.5">
              {data.languages.map((l, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {l.name} · {l.proficiency}
                </Badge>
              ))}
            </div>
          </Section>

          <Section icon={Trophy} title="Awards" count={data.awards.length}>
            {data.awards.map((a, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{a.title}</span>
                {a.issuer && (
                  <span className="text-muted-foreground"> · {a.issuer}</span>
                )}
              </div>
            ))}
          </Section>

          <Section icon={Star} title="Achievements" count={data.achievements.length}>
            {data.achievements.map((a, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{a.title}</span>
              </div>
            ))}
          </Section>

          <Section icon={Globe} title="References" count={data.references.length}>
            {data.references.map((r, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{r.name}</span>
                {r.company && (
                  <span className="text-muted-foreground"> · {r.company}</span>
                )}
              </div>
            ))}
          </Section>
        </CardContent>
      </Card>
    </motion.div>
  );
}
