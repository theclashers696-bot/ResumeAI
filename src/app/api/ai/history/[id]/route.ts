import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const deleted = await prisma.aIGeneration.deleteMany({
      where: { id: params.id, userId: session.user.id },
    });

    if (deleted.count === 0) {
      return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({ message: "Deleted" });
  } catch (err) {
    console.error("[DELETE /api/ai/history/[id]]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const item = await prisma.aIGeneration.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!item) {
      return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({ data: item });
  } catch (err) {
    console.error("[GET /api/ai/history/[id]]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
