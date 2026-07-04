import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateDocx } from "@/lib/docx-generator";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const resume = await prisma.resume.findUnique({
      where: { id, userId: session.user.id },
      include: {
        workExperiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
        languages: { orderBy: { order: "asc" } },
        awards: { orderBy: { order: "asc" } },
        achievements: { orderBy: { order: "asc" } },
      },
    });

    if (!resume) {
      return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });
    }

    const docxBuffer = await generateDocx(resume);

    // Track download
    await Promise.all([
      prisma.download.create({
        data: {
          resumeId: id,
          userId: session.user.id,
          format: "DOCX",
          ip: request.headers.get("x-forwarded-for") ?? undefined,
          userAgent: request.headers.get("user-agent") ?? undefined,
        },
      }),
      prisma.resume.update({
        where: { id },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    const filename = `${resume.title.replace(/[^a-z0-9]/gi, "_")}.docx`;

    return new NextResponse(new Uint8Array(docxBuffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": docxBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("[GET /api/resumes/[id]/export/docx]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
