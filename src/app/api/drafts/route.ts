import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const drafts = await prisma.recoveredDraft.findMany({
      where: {
        userId: session.user.id,
        expiresAt: { gt: now },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return NextResponse.json<ApiResponse>({ data: drafts });
  } catch (err) {
    console.error("[GET /api/drafts]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      resumeId?: string;
      title: string;
      data: Prisma.InputJsonValue;
      source?: string;
    };

    if (!body.title || !body.data) {
      return NextResponse.json<ApiResponse>({ error: "title and data are required" }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    if (body.resumeId) {
      const existing = await prisma.recoveredDraft.findFirst({
        where: { userId: session.user.id, resumeId: body.resumeId },
      });

      if (existing) {
        const updated = await prisma.recoveredDraft.update({
          where: { id: existing.id },
          data: { title: body.title, data: body.data, expiresAt },
        });
        return NextResponse.json<ApiResponse>({ data: updated });
      }
    }

    const draft = await prisma.recoveredDraft.create({
      data: {
        userId: session.user.id,
        resumeId: body.resumeId,
        title: body.title,
        data: body.data,
        source: body.source ?? "autosave",
        expiresAt,
      },
    });

    return NextResponse.json<ApiResponse>({ data: draft }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/drafts]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
