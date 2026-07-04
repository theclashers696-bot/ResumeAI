import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import type { ApiResponse } from "@/types";
import type { ResumeData } from "@/types/resume";

type RouteContext = { params: Promise<{ id: string }> };

type FullResume = NonNullable<Awaited<ReturnType<typeof getFullResume>>>;

function buildResumeData(resume: FullResume): ResumeData {
  return {
    id: resume.id,
    title: resume.title,
    slug: resume.slug,
    template: resume.template,
    isPublic: resume.isPublic,
    sectionOrder: Array.isArray(resume.sectionOrder)
      ? (resume.sectionOrder as string[])
      : JSON.parse(resume.sectionOrder as string),
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
      watermark: resume.watermark,
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
    publications: resume.publications.map((p) => ({
      id: p.id,
      title: p.title,
      publisher: p.publisher ?? "",
      date: p.date ?? "",
      url: p.url ?? "",
      description: p.description ?? "",
      order: p.order,
    })),
    interests: resume.interests.map((i) => ({
      id: i.id,
      name: i.name,
      order: i.order,
    })),
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

async function getFullResume(id: string, userId: string) {
  return prisma.resume.findFirst({
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
      publications: { orderBy: { order: "asc" } },
      interests: { orderBy: { order: "asc" } },
      references: { orderBy: { order: "asc" } },
      customSections: { orderBy: { order: "asc" } },
    },
  });
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const resume = await getFullResume(id, session.user.id);
    if (!resume) return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });

    return NextResponse.json<ApiResponse<ResumeData>>({ data: buildResumeData(resume) });
  } catch (err) {
    console.error("[GET /api/resumes/:id/content]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = (await req.json()) as ResumeData;

    const existing = await prisma.resume.findFirst({ where: { id, userId: session.user.id } });
    if (!existing) return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.resume.update({
        where: { id },
        data: {
          title: body.title,
          template: body.template,
          isPublic: body.isPublic,
          sectionOrder: body.sectionOrder as Prisma.InputJsonValue,
          fullName: body.personal.fullName,
          headline: body.personal.headline,
          email: body.personal.email,
          phone: body.personal.phone,
          location: body.personal.location,
          website: body.personal.website,
          portfolio: body.personal.portfolio,
          github: body.personal.github,
          linkedin: body.personal.linkedin,
          twitter: body.personal.twitter,
          photoUrl: body.personal.photoUrl,
          summary: body.personal.summary,
          themeColor: body.theme.themeColor,
          fontFamily: body.theme.fontFamily,
          fontSize: body.theme.fontSize,
          lineHeight: body.theme.lineHeight,
          pageMargin: body.theme.pageMargin,
          headerStyle: body.theme.headerStyle,
          showIcons: body.theme.showIcons,
        },
      });

      await tx.workExperience.deleteMany({ where: { resumeId: id } });
      if (body.workExperiences.length > 0) {
        await tx.workExperience.createMany({
          data: body.workExperiences.map((w, i) => ({
            resumeId: id,
            company: w.company,
            position: w.position,
            location: w.location,
            employmentType: w.employmentType,
            startDate: w.startDate,
            endDate: w.endDate || null,
            current: w.current,
            description: w.description,
            achievements: w.achievements as Prisma.InputJsonValue,
            technologies: w.technologies as Prisma.InputJsonValue,
            order: i,
          })),
        });
      }

      await tx.education.deleteMany({ where: { resumeId: id } });
      if (body.educations.length > 0) {
        await tx.education.createMany({
          data: body.educations.map((e, i) => ({
            resumeId: id,
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            location: e.location,
            startDate: e.startDate,
            endDate: e.endDate || null,
            current: e.current,
            gpa: e.gpa,
            description: e.description,
            order: i,
          })),
        });
      }

      await tx.skill.deleteMany({ where: { resumeId: id } });
      if (body.skills.length > 0) {
        await tx.skill.createMany({
          data: body.skills.map((s, i) => ({
            resumeId: id,
            name: s.name,
            category: s.category,
            level: s.level,
            rating: s.rating,
            order: i,
          })),
        });
      }

      await tx.project.deleteMany({ where: { resumeId: id } });
      if (body.projects.length > 0) {
        await tx.project.createMany({
          data: body.projects.map((p, i) => ({
            resumeId: id,
            name: p.name,
            description: p.description,
            url: p.url,
            github: p.github,
            technologies: p.technologies as Prisma.InputJsonValue,
            images: p.images as Prisma.InputJsonValue,
            startDate: p.startDate || null,
            endDate: p.endDate || null,
            order: i,
          })),
        });
      }

      await tx.certification.deleteMany({ where: { resumeId: id } });
      if (body.certifications.length > 0) {
        await tx.certification.createMany({
          data: body.certifications.map((c, i) => ({
            resumeId: id,
            name: c.name,
            issuer: c.issuer,
            issueDate: c.issueDate,
            expiryDate: c.expiryDate || null,
            credentialId: c.credentialId,
            url: c.url,
            order: i,
          })),
        });
      }

      await tx.language.deleteMany({ where: { resumeId: id } });
      if (body.languages.length > 0) {
        await tx.language.createMany({
          data: body.languages.map((l, i) => ({
            resumeId: id,
            name: l.name,
            proficiency: l.proficiency,
            order: i,
          })),
        });
      }

      await tx.award.deleteMany({ where: { resumeId: id } });
      if (body.awards.length > 0) {
        await tx.award.createMany({
          data: body.awards.map((a, i) => ({
            resumeId: id,
            title: a.title,
            issuer: a.issuer || null,
            date: a.date || null,
            description: a.description,
            order: i,
          })),
        });
      }

      await tx.achievement.deleteMany({ where: { resumeId: id } });
      if (body.achievements.length > 0) {
        await tx.achievement.createMany({
          data: body.achievements.map((a, i) => ({
            resumeId: id,
            title: a.title,
            description: a.description,
            date: a.date || null,
            order: i,
          })),
        });
      }

      await tx.volunteerWork.deleteMany({ where: { resumeId: id } });
      if (body.volunteerWork.length > 0) {
        await tx.volunteerWork.createMany({
          data: body.volunteerWork.map((v, i) => ({
            resumeId: id,
            organization: v.organization,
            role: v.role,
            startDate: v.startDate || null,
            endDate: v.endDate || null,
            current: v.current,
            description: v.description,
            order: i,
          })),
        });
      }

      await tx.publication.deleteMany({ where: { resumeId: id } });
      if (body.publications.length > 0) {
        await tx.publication.createMany({
          data: body.publications.map((p, i) => ({
            resumeId: id,
            title: p.title,
            publisher: p.publisher || null,
            date: p.date || null,
            url: p.url,
            description: p.description,
            order: i,
          })),
        });
      }

      await tx.interest.deleteMany({ where: { resumeId: id } });
      if (body.interests.length > 0) {
        await tx.interest.createMany({
          data: body.interests.map((item, i) => ({
            resumeId: id,
            name: item.name,
            order: i,
          })),
        });
      }

      await tx.reference.deleteMany({ where: { resumeId: id } });
      if (body.references.length > 0) {
        await tx.reference.createMany({
          data: body.references.map((r, i) => ({
            resumeId: id,
            name: r.name,
            company: r.company || null,
            position: r.position || null,
            phone: r.phone || null,
            email: r.email || null,
            order: i,
          })),
        });
      }

      await tx.customSection.deleteMany({ where: { resumeId: id } });
      if (body.customSections.length > 0) {
        await tx.customSection.createMany({
          data: body.customSections.map((cs, i) => ({
            resumeId: id,
            title: cs.title,
            content: cs.content as unknown as Prisma.InputJsonValue,
            order: i,
          })),
        });
      }
    });

    await prisma.resumeActivity.create({
      data: {
        userId: session.user.id,
        resumeId: id,
        action: "RESUME_UPDATED",
      },
    });

    return NextResponse.json<ApiResponse>({ message: "Saved" });
  } catch (err) {
    console.error("[PATCH /api/resumes/:id/content]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
