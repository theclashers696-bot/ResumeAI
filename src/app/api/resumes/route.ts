import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resumeSchema } from "@/lib/validations/resume";
import { generateUniqueSlug } from "@/lib/utils";
import type { ApiResponse, ResumeListItem } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);
    const skip = (page - 1) * pageSize;

    const [resumes, total] = await Promise.all([
      prisma.resume.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          isPublic: true,
          template: true,
          thumbnailUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.resume.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      data: resumes as ResumeListItem[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/resumes]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = resumeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { error: "Validation failed", message: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const slug = generateUniqueSlug(parsed.data.title);

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: parsed.data.title,
        slug,
        summary: parsed.data.summary,
        template: parsed.data.template,
        isPublic: parsed.data.isPublic,
      },
    });

    return NextResponse.json<ApiResponse<typeof resume>>({ data: resume }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/resumes]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
