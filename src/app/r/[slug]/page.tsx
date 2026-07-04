import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PublicResumeClient } from "@/components/public/public-resume-client";
import type { ResumeData } from "@/types/resume";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resume = await prisma.resume.findUnique({
    where: { slug, isPublic: true },
    select: { title: true, fullName: true, headline: true, summary: true },
  });

  if (!resume) {
    return { title: "Resume Not Found" };
  }

  const name = resume.fullName ?? resume.title;
  const description = resume.summary ?? resume.headline ?? `${name}'s professional resume`;

  return {
    title: `${name} — Resume`,
    description,
    openGraph: {
      title: `${name} — Resume`,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${name} — Resume`,
      description,
    },
  };
}

async function loadPublicResume(slug: string) {
  return prisma.resume.findUnique({
    where: { slug, isPublic: true },
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
      user: { select: { name: true, image: true } },
    },
  });
}

function buildPublicData(resume: NonNullable<Awaited<ReturnType<typeof loadPublicResume>>>): ResumeData {
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

export default async function PublicResumePage({ params }: PageProps) {
  const { slug } = await params;

  const resume = await loadPublicResume(slug);
  if (!resume) {
    notFound();
  }

  const data = buildPublicData(resume);
  const ownerName = resume.user?.name ?? null;

  // Track view server-side (best-effort)
  try {
    await Promise.all([
      prisma.resumeView.create({
        data: { resumeId: resume.id, device: "Unknown" },
      }),
      prisma.resume.update({
        where: { id: resume.id },
        data: { viewCount: { increment: 1 } },
      }),
    ]);
  } catch {
    // non-fatal
  }

  return <PublicResumeClient data={data} ownerName={ownerName} />;
}
