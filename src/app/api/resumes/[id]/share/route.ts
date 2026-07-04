import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import type { ApiResponse } from "@/types";
import type { LinkVisibility } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET  – list share links for a resume
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const links = await prisma.shareLink.findMany({
      where: { resumeId: id, userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse>({ data: links });
  } catch (error) {
    console.error("[GET /api/resumes/[id]/share]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

// POST – create a new share link
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

    const body = await request.json() as {
      label?: string;
      visibility?: LinkVisibility;
      password?: string;
      expiresAt?: string;
      maxViews?: number;
    };

    const { label = "Share Link", visibility = "PUBLIC", password, expiresAt, maxViews } = body;

    let hashedPassword: string | undefined;
    if (visibility === "PASSWORD" && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const link = await prisma.shareLink.create({
      data: {
        resumeId: id,
        userId: session.user.id,
        label,
        visibility,
        password: hashedPassword,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxViews: maxViews ?? null,
      },
    });

    return NextResponse.json<ApiResponse>({ data: link }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/resumes/[id]/share]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE – delete a specific share link
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get("linkId");

    if (!linkId) {
      return NextResponse.json<ApiResponse>({ error: "linkId required" }, { status: 400 });
    }

    await prisma.shareLink.deleteMany({
      where: { id: linkId, userId: session.user.id, resumeId: id },
    });

    return NextResponse.json<ApiResponse>({ data: { deleted: true } });
  } catch (error) {
    console.error("[DELETE /api/resumes/[id]/share]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH – toggle active / update link
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json() as {
      linkId: string;
      isActive?: boolean;
      label?: string;
      expiresAt?: string | null;
    };

    const { linkId, isActive, label, expiresAt } = body;

    const link = await prisma.shareLink.updateMany({
      where: { id: linkId, userId: session.user.id, resumeId: id },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(label !== undefined ? { label } : {}),
        ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
      },
    });

    return NextResponse.json<ApiResponse>({ data: link });
  } catch (error) {
    console.error("[PATCH /api/resumes/[id]/share]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
