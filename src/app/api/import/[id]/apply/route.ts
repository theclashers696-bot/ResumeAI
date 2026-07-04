import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/utils";
import type { ApiResponse } from "@/types";
import type { ParsedResume } from "@/lib/resume-parser";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      mode: "create" | "merge";
      targetResumeId?: string;
      overrides?: Partial<ParsedResume>;
    };

    const record = await prisma.resumeImport.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!record) {
      return NextResponse.json<ApiResponse>({ error: "Import not found" }, { status: 404 });
    }

    if (!record.parsedData) {
      return NextResponse.json<ApiResponse>(
        { error: "No parsed data available for this import" },
        { status: 422 }
      );
    }

    const parsed = (record.aiEnhanced ?? record.parsedData) as unknown as ParsedResume;
    const data = body.overrides ? { ...parsed, ...body.overrides } : parsed;

    if (body.mode === "merge" && body.targetResumeId) {
      const existing = await prisma.resume.findFirst({
        where: { id: body.targetResumeId, userId: session.user.id },
      });
      if (!existing) {
        return NextResponse.json<ApiResponse>({ error: "Target resume not found" }, { status: 404 });
      }

      await mergeIntoResume(body.targetResumeId, data, session.user.id);

      await prisma.resumeImport.update({
        where: { id: record.id },
        data: { status: "COMPLETED", resumeId: body.targetResumeId },
      });

      await prisma.importHistory.create({
        data: {
          importId: record.id,
          userId: session.user.id,
          action: "MERGED",
          metadata: { targetResumeId: body.targetResumeId },
        },
      });

      return NextResponse.json<ApiResponse>({
        data: { resumeId: body.targetResumeId, mode: "merge" },
      });
    }

    const resume = await createResumeFromParsed(session.user.id, data, record.fileName);

    await prisma.resumeImport.update({
      where: { id: record.id },
      data: { status: "COMPLETED", resumeId: resume.id },
    });

    await prisma.importHistory.create({
      data: {
        importId: record.id,
        userId: session.user.id,
        action: "CREATED",
        metadata: { resumeId: resume.id, title: resume.title },
      },
    });

    await prisma.resumeActivity.create({
      data: {
        userId: session.user.id,
        resumeId: resume.id,
        action: "RESUME_IMPORTED",
        metadata: { importId: record.id, fileName: record.fileName },
      },
    });

    return NextResponse.json<ApiResponse>({
      data: { resumeId: resume.id, slug: resume.slug, mode: "create" },
    });
  } catch (err) {
    console.error("[POST /api/import/[id]/apply]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

async function createResumeFromParsed(
  userId: string,
  data: ParsedResume,
  fileName: string
) {
  const title = data.fullName
    ? `${data.fullName}'s Resume`
    : fileName.replace(/\.(pdf|docx?|txt|json)$/i, "") || "Imported Resume";
  const slug = generateUniqueSlug(title);

  const resume = await prisma.resume.create({
    data: {
      userId,
      title,
      slug,
      fullName: data.fullName,
      headline: data.headline,
      email: data.email,
      phone: data.phone,
      location: data.location,
      website: data.website,
      portfolio: data.portfolio,
      github: data.github,
      linkedin: data.linkedin,
      twitter: data.twitter,
      summary: data.summary,
    },
  });

  await Promise.all([
    data.workExperiences.length > 0 &&
      prisma.workExperience.createMany({
        data: data.workExperiences.map((e, i) => ({
          resumeId: resume.id,
          company: e.company,
          position: e.position,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          description: e.description,
          achievements: e.achievements as Prisma.InputJsonValue,
          technologies: e.technologies as Prisma.InputJsonValue,
          order: i,
        })),
      }),
    data.educations.length > 0 &&
      prisma.education.createMany({
        data: data.educations.map((e, i) => ({
          resumeId: resume.id,
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          gpa: e.gpa,
          description: e.description,
          order: i,
        })),
      }),
    data.skills.length > 0 &&
      prisma.skill.createMany({
        data: data.skills.map((s, i) => ({
          resumeId: resume.id,
          name: s.name,
          category: s.category,
          level: s.level,
          order: i,
        })),
      }),
    data.projects.length > 0 &&
      prisma.project.createMany({
        data: data.projects.map((p, i) => ({
          resumeId: resume.id,
          name: p.name,
          description: p.description,
          url: p.url,
          github: p.github,
          technologies: p.technologies as Prisma.InputJsonValue,
          startDate: p.startDate,
          endDate: p.endDate,
          order: i,
        })),
      }),
    data.certifications.length > 0 &&
      prisma.certification.createMany({
        data: data.certifications.map((c, i) => ({
          resumeId: resume.id,
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate,
          expiryDate: c.expiryDate,
          credentialId: c.credentialId,
          url: c.url,
          order: i,
        })),
      }),
    data.languages.length > 0 &&
      prisma.language.createMany({
        data: data.languages.map((l, i) => ({
          resumeId: resume.id,
          name: l.name,
          proficiency: l.proficiency,
          order: i,
        })),
      }),
    data.awards.length > 0 &&
      prisma.award.createMany({
        data: data.awards.map((a, i) => ({
          resumeId: resume.id,
          title: a.title,
          issuer: a.issuer,
          date: a.date,
          description: a.description,
          order: i,
        })),
      }),
    data.achievements.length > 0 &&
      prisma.achievement.createMany({
        data: data.achievements.map((a, i) => ({
          resumeId: resume.id,
          title: a.title,
          description: a.description,
          date: a.date,
          order: i,
        })),
      }),
    data.references.length > 0 &&
      prisma.reference.createMany({
        data: data.references.map((r, i) => ({
          resumeId: resume.id,
          name: r.name,
          company: r.company,
          position: r.position,
          phone: r.phone,
          email: r.email,
          order: i,
        })),
      }),
  ]);

  return resume;
}

async function mergeIntoResume(
  resumeId: string,
  data: ParsedResume,
  _userId: string
) {
  await prisma.resume.update({
    where: { id: resumeId },
    data: {
      fullName: data.fullName ?? undefined,
      headline: data.headline ?? undefined,
      email: data.email ?? undefined,
      phone: data.phone ?? undefined,
      location: data.location ?? undefined,
      website: data.website ?? undefined,
      portfolio: data.portfolio ?? undefined,
      github: data.github ?? undefined,
      linkedin: data.linkedin ?? undefined,
      twitter: data.twitter ?? undefined,
      summary: data.summary ?? undefined,
    },
  });

  const [existingSkills, existingExps, existingEdus] = await Promise.all([
    prisma.skill.findMany({ where: { resumeId }, select: { name: true } }),
    prisma.workExperience.findMany({
      where: { resumeId },
      select: { company: true, position: true },
    }),
    prisma.education.findMany({
      where: { resumeId },
      select: { institution: true, degree: true },
    }),
  ]);

  const existingSkillNames = new Set(existingSkills.map((s) => s.name.toLowerCase()));
  const newSkills = data.skills.filter(
    (s) => !existingSkillNames.has(s.name.toLowerCase())
  );

  const existingExpKeys = new Set(
    existingExps.map((e) => `${e.company.toLowerCase()}|${e.position.toLowerCase()}`)
  );
  const newExps = data.workExperiences.filter(
    (e) => !existingExpKeys.has(`${e.company.toLowerCase()}|${e.position.toLowerCase()}`)
  );

  const existingEduKeys = new Set(
    existingEdus.map((e) => `${e.institution.toLowerCase()}|${e.degree.toLowerCase()}`)
  );
  const newEdus = data.educations.filter(
    (e) => !existingEduKeys.has(`${e.institution.toLowerCase()}|${e.degree.toLowerCase()}`)
  );

  await Promise.all([
    newSkills.length > 0 &&
      prisma.skill.createMany({
        data: newSkills.map((s, i) => ({
          resumeId,
          name: s.name,
          category: s.category,
          level: s.level,
          order: 1000 + i,
        })),
      }),
    newExps.length > 0 &&
      prisma.workExperience.createMany({
        data: newExps.map((e, i) => ({
          resumeId,
          company: e.company,
          position: e.position,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          description: e.description,
          achievements: e.achievements as Prisma.InputJsonValue,
          technologies: e.technologies as Prisma.InputJsonValue,
          order: 1000 + i,
        })),
      }),
    newEdus.length > 0 &&
      prisma.education.createMany({
        data: newEdus.map((e, i) => ({
          resumeId,
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          current: e.current,
          gpa: e.gpa,
          description: e.description,
          order: 1000 + i,
        })),
      }),
  ]);
}
