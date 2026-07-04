import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/utils";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const workExpSchema = z.object({
  company: z.string(),
  position: z.string(),
  location: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  current: z.boolean().optional().default(false),
  description: z.string().optional().default(""),
  achievements: z.array(z.string()).optional().default([]),
});

const educationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  fieldOfStudy: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

const skillSchema = z.object({
  name: z.string(),
  category: z.string().optional().default(""),
});

const projectSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(""),
  technologies: z.array(z.string()).optional().default([]),
});

const certSchema = z.object({
  name: z.string(),
  issuer: z.string().optional().default(""),
  issueDate: z.string().optional().default("2024-01"),
});

const achievementSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(""),
});

const bodySchema = z.object({
  title: z.string().max(200).optional().default("AI Generated Resume"),
  summary: z.string().optional().default(""),
  workExperiences: z.array(workExpSchema).optional().default([]),
  educations: z.array(educationSchema).optional().default([]),
  skills: z.array(skillSchema).optional().default([]),
  projects: z.array(projectSchema).optional().default([]),
  certifications: z.array(certSchema).optional().default([]),
  achievements: z.array(achievementSchema).optional().default([]),
});

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const slug = generateUniqueSlug(d.title);

    const resume = await prisma.$transaction(async (tx) => {
      const r = await tx.resume.create({
        data: {
          userId: session.user.id,
          title: d.title,
          slug,
          summary: d.summary || null,
        },
      });

      if (d.workExperiences.length > 0) {
        await tx.workExperience.createMany({
          data: d.workExperiences.map((w, i) => ({
            resumeId: r.id,
            company: w.company,
            position: w.position,
            location: w.location,
            startDate: w.startDate || "2022-01",
            endDate: w.endDate || null,
            current: w.current,
            description: w.description,
            achievements: w.achievements as Prisma.InputJsonValue,
            technologies: [] as Prisma.InputJsonValue,
            order: i,
          })),
        });
      }

      if (d.educations.length > 0) {
        await tx.education.createMany({
          data: d.educations.map((e, i) => ({
            resumeId: r.id,
            institution: e.institution,
            degree: e.degree,
            fieldOfStudy: e.fieldOfStudy,
            startDate: e.startDate || "2018-09",
            endDate: e.endDate || null,
            current: false,
            description: e.description,
            order: i,
          })),
        });
      }

      if (d.skills.length > 0) {
        await tx.skill.createMany({
          data: d.skills.map((s, i) => ({
            resumeId: r.id,
            name: s.name,
            category: s.category || null,
            order: i,
          })),
        });
      }

      if (d.projects.length > 0) {
        await tx.project.createMany({
          data: d.projects.map((p, i) => ({
            resumeId: r.id,
            name: p.name,
            description: p.description,
            technologies: p.technologies as Prisma.InputJsonValue,
            images: [] as Prisma.InputJsonValue,
            order: i,
          })),
        });
      }

      if (d.certifications.length > 0) {
        await tx.certification.createMany({
          data: d.certifications.map((c, i) => ({
            resumeId: r.id,
            name: c.name,
            issuer: c.issuer || "N/A",
            issueDate: c.issueDate,
            order: i,
          })),
        });
      }

      if (d.achievements.length > 0) {
        await tx.achievement.createMany({
          data: d.achievements.map((a, i) => ({
            resumeId: r.id,
            title: a.title,
            description: a.description,
            order: i,
          })),
        });
      }

      await tx.resumeActivity.create({
        data: {
          userId: session.user.id,
          resumeId: r.id,
          action: "RESUME_CREATED",
        },
      });

      return r;
    });

    return NextResponse.json<ApiResponse>({ data: { id: resume.id, title: resume.title } }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/ai/resume/apply]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
