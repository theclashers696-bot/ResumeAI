import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET – list download history for a resume
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "20", 10), 100);

    const resume = await prisma.resume.findUnique({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!resume) {
      return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });
    }

    const [downloads, total] = await Promise.all([
      prisma.download.findMany({
        where: { resumeId: id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          format: true,
          createdAt: true,
          userAgent: true,
        },
      }),
      prisma.download.count({ where: { resumeId: id } }),
    ]);

    return NextResponse.json({
      data: downloads,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/resumes/[id]/downloads]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
