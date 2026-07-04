import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resumeSchema } from "@/lib/validations/resume";
import type { ApiResponse } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const resume = await prisma.resume.findFirst({
      where: { id, userId: session.user.id },
      include: {
        workExperiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
      },
    });

    if (!resume) {
      return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<typeof resume>>({ data: resume });
  } catch (error) {
    console.error("[GET /api/resumes/:id]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = resumeSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { error: "Validation failed", message: parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const existing = await prisma.resume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });
    }

    const resume = await prisma.resume.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json<ApiResponse<typeof resume>>({ data: resume });
  } catch (error) {
    console.error("[PATCH /api/resumes/:id]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.resume.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });
    }

    await prisma.resume.delete({ where: { id } });

    return NextResponse.json<ApiResponse>({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("[DELETE /api/resumes/:id]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
