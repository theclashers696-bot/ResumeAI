import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const resume = await prisma.resume.findFirst({ where: { id, userId: session.user.id } });
    if (!resume) return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });

    const versions = await prisma.resumeVersion.findMany({
      where: { resumeId: id },
      orderBy: { createdAt: "desc" },
      select: { id: true, label: true, createdAt: true },
    });

    return NextResponse.json<ApiResponse>({ data: versions });
  } catch (err) {
    console.error("[GET versions]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const resume = await prisma.resume.findFirst({ where: { id, userId: session.user.id } });
    if (!resume) return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });

    const { label, snapshot } = await req.json();

    const version = await prisma.resumeVersion.create({
      data: { resumeId: id, label: label || `Version ${new Date().toLocaleString()}`, snapshot },
    });

    await prisma.resumeActivity.create({
      data: { userId: session.user.id, resumeId: id, action: "VERSION_CREATED" },
    });

    return NextResponse.json<ApiResponse>({ data: version });
  } catch (err) {
    console.error("[POST versions]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
