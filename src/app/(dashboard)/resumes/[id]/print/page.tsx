import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PrintClient } from "@/components/resume/print-client";
import type { ResumeData } from "@/types/resume";
import type { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Print Resume — ResumeAI",
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ size?: string }>;
}

type LoadedResume = Prisma.ResumeGetPayload<{
  include: {
    workExperiences: true;
    educations: true;
    skills: true;
    projects: true;
    certifications: true;
    languages: true;
    awards: true;
    achievements: true;
    volunteerWork: true;
    interests: true;
    references: true;
    customSections: true;
  };
}>;

function buildPrintData(resume: LoadedResume): ResumeData {
  if (!resume) throw new Error("No resume");
  return {
    id: resume.id,
    title: resume.title,
    slug: resume.slug,
    template: resume.template,
    isPublic: resume.isPublic,
    sectionOrder: Array.isArray(resume.sectionOrder)
      ? (resume.sectionOrder as string[])
      : ["summary", "experience", "education", "skills", "projects", "certifications"],
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
      id: w.id,
      company: w.company,
      position: w.position,
      location: w.location ?? "",
      employmentType: w.employmentType ?? "",
      startDate: w.startDate,
      endDate: w.endDate ?? "",
      current: w.current,
      description: w.description ?? "",
      achievements: Array.isArray(w.achievements) ? (w.achievements as string[]) : [],
      technologies: Array.isArray(w.technologies) ? (w.technologies as string[]) : [],
      order: w.order,
    })),
    educations: resume.educations.map((e) => ({
      id: e.id,
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy ?? "",
      location: e.location ?? "",
      startDate: e.startDate,
      endDate: e.endDate ?? "",
      current: e.current,
      gpa: e.gpa ?? "",
      description: e.description ?? "",
      order: e.order,
    })),
    skills: resume.skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category ?? "",
      level: s.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT",
      rating: s.rating,
      order: s.order,
    })),
    projects: resume.projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      url: p.url ?? "",
      github: p.github ?? "",
      technologies: Array.isArray(p.technologies) ? (p.technologies as string[]) : [],
      images: Array.isArray(p.images) ? (p.images as string[]) : [],
      startDate: p.startDate ?? "",
      endDate: p.endDate ?? "",
      order: p.order,
    })),
    certifications: resume.certifications.map((c) => ({
      id: c.id,
      name: c.name,
      issuer: c.issuer,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate ?? "",
      credentialId: c.credentialId ?? "",
      url: c.url ?? "",
      order: c.order,
    })),
    languages: resume.languages.map((l) => ({
      id: l.id,
      name: l.name,
      proficiency: l.proficiency,
      order: l.order,
    })),
    awards: resume.awards.map((a) => ({
      id: a.id,
      title: a.title,
      issuer: a.issuer ?? "",
      date: a.date ?? "",
      description: a.description ?? "",
      order: a.order,
    })),
    achievements: resume.achievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description ?? "",
      date: a.date ?? "",
      order: a.order,
    })),
    volunteerWork: resume.volunteerWork.map((v) => ({
      id: v.id,
      organization: v.organization,
      role: v.role,
      startDate: v.startDate ?? "",
      endDate: v.endDate ?? "",
      current: v.current,
      description: v.description ?? "",
      order: v.order,
    })),
    publications: [],
    interests: resume.interests.map((i) => ({ id: i.id, name: i.name, order: i.order })),
    references: resume.references.map((r) => ({
      id: r.id,
      name: r.name,
      company: r.company ?? "",
      position: r.position ?? "",
      phone: r.phone ?? "",
      email: r.email ?? "",
      order: r.order,
    })),
    customSections: resume.customSections.map((cs) => ({
      id: cs.id,
      title: cs.title,
      content: Array.isArray(cs.content) ? (cs.content as never[]) : [],
      order: cs.order,
    })),
  };
}

async function loadResume(id: string, userId: string) {
  return prisma.resume.findUnique({
    where: { id, userId },
    include: {
      workExperiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
      languages: { orderBy: { order: "asc" } },
      awards: { orderBy: { order: "asc" } },
      achievements: { orderBy: { order: "asc" } },
      volunteerWork: { orderBy: { order: "asc" } },
      interests: { orderBy: { order: "asc" } },
      references: { orderBy: { order: "asc" } },
      customSections: { orderBy: { order: "asc" } },
    },
  });
}

export default async function PrintPage({ params, searchParams }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) notFound();

  const { id } = await params;
  const { size = "A4" } = await searchParams;
  const pageSize = size === "Letter" ? "Letter" : "A4";

  const resume = await loadResume(id, session.user.id);
  if (!resume) notFound();

  const data = buildPrintData(resume);

  return <PrintClient data={data} pageSize={pageSize} />;
}
