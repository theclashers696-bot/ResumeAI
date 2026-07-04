import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await prisma.resumeImport.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        resume: { select: { id: true, title: true, slug: true } },
        history: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });

    if (!record) {
      return NextResponse.json<ApiResponse>({ error: "Import not found" }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({ data: record });
  } catch (err) {
    console.error("[GET /api/import/[id]]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await prisma.resumeImport.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!record) {
      return NextResponse.json<ApiResponse>({ error: "Import not found" }, { status: 404 });
    }

    await prisma.resumeImport.delete({ where: { id: params.id } });

    return NextResponse.json<ApiResponse>({ message: "Import deleted" });
  } catch (err) {
    console.error("[DELETE /api/import/[id]]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
