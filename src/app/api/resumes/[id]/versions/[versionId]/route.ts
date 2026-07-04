import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

type RouteContext = { params: Promise<{ id: string; versionId: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    const { id, versionId } = await params;

    const resume = await prisma.resume.findFirst({ where: { id, userId: session.user.id } });
    if (!resume) return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });

    const version = await prisma.resumeVersion.findFirst({
      where: { id: versionId, resumeId: id },
    });
    if (!version) return NextResponse.json<ApiResponse>({ error: "Version not found" }, { status: 404 });

    return NextResponse.json<ApiResponse>({ data: version });
  } catch (err) {
    console.error("[GET version]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    const { id, versionId } = await params;

    const resume = await prisma.resume.findFirst({ where: { id, userId: session.user.id } });
    if (!resume) return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });

    await prisma.resumeVersion.deleteMany({ where: { id: versionId, resumeId: id } });
    return NextResponse.json<ApiResponse>({ message: "Deleted" });
  } catch (err) {
    console.error("[DELETE version]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
