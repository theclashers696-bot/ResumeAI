"use client";

import { useState, useEffect } from "react";
import { Lock, AlertCircle, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PublicResumeClient } from "./public-resume-client";
import type { ResumeData } from "@/types/resume";

interface ShareLinkClientProps {
  token: string;
}

type Status = "loading" | "password-required" | "loaded" | "error" | "expired";

// Minimal DB shape returned by the share API
interface ShareApiResume {
  id: string;
  title: string;
  slug: string;
  fullName: string | null;
  headline: string | null;
  summary: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  portfolio: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  photoUrl: string | null;
  template: string;
  isPublic: boolean;
  themeColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  pageMargin: number;
  headerStyle: string;
  showIcons: boolean;
  secondaryColor: string;
  accentColor: string;
  photoShape: string;
  sectionStyle: string;
  borderRadius: number;
  showDividers: boolean;
  columnLayout: string;
  watermark: boolean;
  sectionOrder: unknown;
  workExperiences: Array<{
    id: string; company: string; position: string; location: string | null;
    employmentType: string | null; startDate: string; endDate: string | null;
    current: boolean; description: string | null; achievements: unknown;
    technologies: unknown; order: number;
  }>;
  educations: Array<{
    id: string; institution: string; degree: string; fieldOfStudy: string | null;
    location: string | null; startDate: string; endDate: string | null;
    current: boolean; gpa: string | null; description: string | null; order: number;
  }>;
  skills: Array<{ id: string; name: string; category: string | null; level: string; rating: number; order: number }>;
  projects: Array<{ id: string; name: string; description: string | null; url: string | null; github: string | null; technologies: unknown; images: unknown; startDate: string | null; endDate: string | null; order: number }>;
  certifications: Array<{ id: string; name: string; issuer: string; issueDate: string; expiryDate: string | null; credentialId: string | null; url: string | null; order: number }>;
  languages: Array<{ id: string; name: string; proficiency: string; order: number }>;
  awards: Array<{ id: string; title: string; issuer: string | null; date: string | null; description: string | null; order: number }>;
  achievements: Array<{ id: string; title: string; description: string | null; date: string | null; order: number }>;
  volunteerWork: Array<{ id: string; organization: string; role: string; startDate: string | null; endDate: string | null; current: boolean; description: string | null; order: number }>;
  interests: Array<{ id: string; name: string; order: number }>;
  references: Array<{ id: string; name: string; company: string | null; position: string | null; phone: string | null; email: string | null; order: number }>;
  customSections: Array<{ id: string; title: string; content: unknown; order: number }>;
  user: { name: string; image: string | null } | null;
}

function buildResumeData(resume: ShareApiResume): ResumeData {
  const sectionOrder = Array.isArray(resume.sectionOrder)
    ? (resume.sectionOrder as string[])
    : ["summary", "experience", "education", "skills", "projects", "certifications"];

  return {
    id: resume.id,
    title: resume.title,
    slug: resume.slug,
    template: resume.template,
    isPublic: resume.isPublic,
    sectionOrder,
    personal: {
      fullName: resume.fullName ?? "",
      headline: resume.headline ?? "",
      email: resume.email ?? "",
      phone: resume.phone ?? "",
      location: resume.location ?? "",
      website: resume.website ?? "",
      portfolio: resume.portfolio ?? "",
      github: resume.github ?? "",
      linkedin: resume.linkedin ?? "",
      twitter: resume.twitter ?? "",
      photoUrl: resume.photoUrl ?? "",
      summary: resume.summary ?? "",
    },
    theme: {
      themeColor: resume.themeColor,
      fontFamily: resume.fontFamily,
      fontSize: resume.fontSize,
      lineHeight: resume.lineHeight,
      pageMargin: resume.pageMargin,
      headerStyle: resume.headerStyle,
      showIcons: resume.showIcons,
      secondaryColor: resume.secondaryColor,
      accentColor: resume.accentColor,
      photoShape: resume.photoShape as "circle" | "square" | "rounded",
      sectionStyle: resume.sectionStyle as "line" | "box" | "underline" | "caps" | "none",
      borderRadius: resume.borderRadius,
      showDividers: resume.showDividers,
      columnLayout: resume.columnLayout as "single" | "two-column" | "hybrid",
      watermark: false,
    },
    workExperiences: resume.workExperiences.map((w) => ({
      id: w.id, company: w.company, position: w.position,
      location: w.location ?? "", employmentType: w.employmentType ?? "",
      startDate: w.startDate, endDate: w.endDate ?? "", current: w.current,
      description: w.description ?? "",
      achievements: Array.isArray(w.achievements) ? (w.achievements as string[]) : [],
      technologies: Array.isArray(w.technologies) ? (w.technologies as string[]) : [],
      order: w.order,
    })),
    educations: resume.educations.map((e) => ({
      id: e.id, institution: e.institution, degree: e.degree,
      fieldOfStudy: e.fieldOfStudy ?? "", location: e.location ?? "",
      startDate: e.startDate, endDate: e.endDate ?? "", current: e.current,
      gpa: e.gpa ?? "", description: e.description ?? "", order: e.order,
    })),
    skills: resume.skills.map((s) => ({
      id: s.id, name: s.name, category: s.category ?? "",
      level: s.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
      rating: s.rating, order: s.order,
    })),
    projects: resume.projects.map((p) => ({
      id: p.id, name: p.name, description: p.description ?? "",
      url: p.url ?? "", github: p.github ?? "",
      technologies: Array.isArray(p.technologies) ? (p.technologies as string[]) : [],
      images: Array.isArray(p.images) ? (p.images as string[]) : [],
      startDate: p.startDate ?? "", endDate: p.endDate ?? "", order: p.order,
    })),
    certifications: resume.certifications.map((c) => ({
      id: c.id, name: c.name, issuer: c.issuer, issueDate: c.issueDate,
      expiryDate: c.expiryDate ?? "", credentialId: c.credentialId ?? "",
      url: c.url ?? "", order: c.order,
    })),
    languages: resume.languages.map((l) => ({ id: l.id, name: l.name, proficiency: l.proficiency, order: l.order })),
    awards: resume.awards.map((a) => ({
      id: a.id, title: a.title, issuer: a.issuer ?? "", date: a.date ?? "",
      description: a.description ?? "", order: a.order,
    })),
    achievements: resume.achievements.map((a) => ({
      id: a.id, title: a.title, description: a.description ?? "", date: a.date ?? "", order: a.order,
    })),
    volunteerWork: resume.volunteerWork.map((v) => ({
      id: v.id, organization: v.organization, role: v.role,
      startDate: v.startDate ?? "", endDate: v.endDate ?? "", current: v.current,
      description: v.description ?? "", order: v.order,
    })),
    publications: [],
    interests: resume.interests.map((i) => ({ id: i.id, name: i.name, order: i.order })),
    references: resume.references.map((r) => ({
      id: r.id, name: r.name, company: r.company ?? "", position: r.position ?? "",
      phone: r.phone ?? "", email: r.email ?? "", order: r.order,
    })),
    customSections: resume.customSections.map((cs) => ({
      id: cs.id, title: cs.title,
      content: Array.isArray(cs.content) ? (cs.content as never[]) : [],
      order: cs.order,
    })),
  };
}

export function ShareLinkClient({ token }: ShareLinkClientProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [resumeTitle, setResumeTitle] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch(`/api/share/${token}`)
      .then((r) => r.json())
      .then((json: { data?: { requiresPassword?: boolean; resumeTitle?: string; label?: string; resume?: ShareApiResume }; error?: string }) => {
        if (json.error) {
          if (json.error.includes("expired") || json.error.includes("limit") || json.error.includes("deactivated")) {
            setStatus("expired");
          } else {
            setStatus("error");
          }
          setErrorMsg(json.error);
          return;
        }
        if (json.data?.requiresPassword) {
          setResumeTitle(json.data.resumeTitle ?? "Shared Resume");
          setStatus("password-required");
          return;
        }
        if (json.data?.resume) {
          setResumeData(buildResumeData(json.data.resume));
          setOwnerName(json.data.resume.user?.name ?? null);
          setStatus("loaded");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Failed to load resume.");
      });
  }, [token]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await fetch(`/api/share/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await r.json() as { data?: { resume?: ShareApiResume }; error?: string };
      if (json.error) {
        setErrorMsg(json.error);
      } else if (json.data?.resume) {
        setResumeData(buildResumeData(json.data.resume));
        setOwnerName(json.data.resume.user?.name ?? null);
        setStatus("loaded");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading resume…</p>
      </div>
    );
  }

  if (status === "loaded" && resumeData) {
    return <PublicResumeClient data={resumeData} ownerName={ownerName} />;
  }

  if (status === "password-required") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-lg">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-semibold">Password Required</h1>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{resumeTitle}</span> is password-protected.
            </p>
          </div>

          <form onSubmit={(e) => { void handlePasswordSubmit(e); }} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorMsg(""); }}
              placeholder="Enter password"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              required
              autoFocus
            />
            {errorMsg && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {errorMsg}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "View Resume"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-primary">
              <Globe className="mr-1 inline h-3 w-3" />
              ResumeAI
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isExpired = status === "expired";

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 text-center shadow-lg">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mx-auto">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="mb-2 text-xl font-semibold">{isExpired ? "Link Expired" : "Not Available"}</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {errorMsg || "This resume link is no longer available."}
        </p>
        <Link href="/">
          <Button variant="outline" className="gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Go to ResumeAI
          </Button>
        </Link>
      </div>
    </div>
  );
}
