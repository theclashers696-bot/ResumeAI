import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateUniqueSlug } from "@/lib/utils";
import { logActivity } from "@/lib/activity";
import type { Prisma } from "@prisma/client";
import type { ApiResponse, ResumeListItem } from "@/types";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const original = await prisma.resume.findUnique({
    where: { id },
    include: {
      workExperiences: true,
      educations: true,
      skills: true,
      projects: true,
      certifications: true,
    },
  });

  if (!original || original.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slug = generateUniqueSlug(`${original.title}-copy`);

  const duplicated = await prisma.resume.create({
    data: {
      userId: session.user.id,
      title: `${original.title} (Copy)`,
      slug,
      isPublic: false,
      template: original.template,
      summary: original.summary,
      atsScore: original.atsScore,
      workExperiences: {
        create: original.workExperiences.map(({ id: _id, resumeId: _rid, createdAt: _ca, updatedAt: _ua, ...e }) => ({
          ...e,
          achievements: e.achievements as Prisma.InputJsonValue,
          technologies: e.technologies as Prisma.InputJsonValue,
        })),
      },
      educations: {
        create: original.educations.map(({ id: _id, resumeId: _rid, createdAt: _ca, updatedAt: _ua, ...e }) => e),
      },
      skills: {
        create: original.skills.map(({ id: _id, resumeId: _rid, createdAt: _ca, updatedAt: _ua, ...e }) => e),
      },
      projects: {
        create: original.projects.map(({ id: _id, resumeId: _rid, createdAt: _ca, updatedAt: _ua, ...e }) => ({
          ...e,
          technologies: e.technologies as Prisma.InputJsonValue,
          images: e.images as Prisma.InputJsonValue,
        })),
      },
      certifications: {
        create: original.certifications.map(({ id: _id, resumeId: _rid, createdAt: _ca, updatedAt: _ua, ...e }) => e),
      },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      isPublic: true,
      template: true,
      thumbnailUrl: true,
      atsScore: true,
      isFavorite: true,
      isArchived: true,
      downloadCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logActivity(session.user.id, "RESUME_DUPLICATED", duplicated.id, {
    originalId: id,
    title: duplicated.title,
  });

  return NextResponse.json<ApiResponse<ResumeListItem>>({ data: duplicated as ResumeListItem });
}
