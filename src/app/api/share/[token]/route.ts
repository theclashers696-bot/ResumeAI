import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ token: string }>;
}

function detectDevice(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

// GET – resolve a share link and return resume data
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    const link = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        resume: {
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
            user: { select: { name: true, email: true, image: true } },
          },
        },
      },
    });

    if (!link) {
      return NextResponse.json<ApiResponse>({ error: "Link not found" }, { status: 404 });
    }

    if (!link.isActive) {
      return NextResponse.json<ApiResponse>({ error: "This link has been deactivated" }, { status: 410 });
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      return NextResponse.json<ApiResponse>({ error: "This link has expired" }, { status: 410 });
    }

    if (link.maxViews && link.viewCount >= link.maxViews) {
      return NextResponse.json<ApiResponse>({ error: "View limit reached for this link" }, { status: 410 });
    }

    if (link.visibility === "PRIVATE") {
      return NextResponse.json<ApiResponse>({ error: "This resume is private" }, { status: 403 });
    }

    // For PASSWORD links, return metadata only; client must POST with password
    if (link.visibility === "PASSWORD") {
      return NextResponse.json<ApiResponse>({
        data: {
          requiresPassword: true,
          label: link.label,
          resumeTitle: link.resume.title,
        },
      });
    }

    // Track view
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ua = request.headers.get("user-agent") ?? "";
    const referrer = request.headers.get("referer") ?? undefined;

    await Promise.all([
      prisma.resumeView.create({
        data: {
          resumeId: link.resumeId,
          shareLinkId: link.id,
          ip,
          userAgent: ua,
          device: detectDevice(ua),
          referrer,
        },
      }),
      prisma.shareLink.update({
        where: { id: link.id },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.resume.update({
        where: { id: link.resumeId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json<ApiResponse>({ data: { resume: link.resume, link: { label: link.label, token: link.token } } });
  } catch (error) {
    console.error("[GET /api/share/[token]]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

// POST – verify password for password-protected links
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;
    const body = await request.json() as { password: string };

    const link = await prisma.shareLink.findUnique({
      where: { token },
      include: {
        resume: {
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
            customSections: { orderBy: { order: "asc" } },
            user: { select: { name: true, email: true, image: true } },
          },
        },
      },
    });

    if (!link || !link.isActive) {
      return NextResponse.json<ApiResponse>({ error: "Link not found" }, { status: 404 });
    }

    if (link.expiresAt && link.expiresAt < new Date()) {
      return NextResponse.json<ApiResponse>({ error: "This link has expired" }, { status: 410 });
    }

    if (link.visibility !== "PASSWORD" || !link.password) {
      return NextResponse.json<ApiResponse>({ error: "Not a password-protected link" }, { status: 400 });
    }

    const valid = await bcrypt.compare(body.password, link.password);
    if (!valid) {
      return NextResponse.json<ApiResponse>({ error: "Incorrect password" }, { status: 401 });
    }

    // Track view
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ua = request.headers.get("user-agent") ?? "";

    await Promise.all([
      prisma.resumeView.create({
        data: {
          resumeId: link.resumeId,
          shareLinkId: link.id,
          ip,
          userAgent: ua,
          device: detectDevice(ua),
        },
      }),
      prisma.shareLink.update({
        where: { id: link.id },
        data: { viewCount: { increment: 1 } },
      }),
      prisma.resume.update({
        where: { id: link.resumeId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json<ApiResponse>({ data: { resume: link.resume, link: { label: link.label } } });
  } catch (error) {
    console.error("[POST /api/share/[token]]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
