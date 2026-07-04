import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST – record a PDF download (triggered client-side after PDF generation)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const resume = await prisma.resume.findUnique({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!resume) {
      return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });
    }

    await Promise.all([
      prisma.download.create({
        data: {
          resumeId: id,
          userId: session.user.id,
          format: "PDF",
          ip: request.headers.get("x-forwarded-for") ?? undefined,
          userAgent: request.headers.get("user-agent") ?? undefined,
        },
      }),
      prisma.resume.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json<ApiResponse>({ data: { tracked: true } });
  } catch (error) {
    console.error("[POST /api/resumes/[id]/export/pdf-track]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
