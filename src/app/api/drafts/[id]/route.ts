import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const draft = await prisma.recoveredDraft.findFirst({
      where: { id: params.id, userId: session.user.id },
    });

    if (!draft) {
      return NextResponse.json<ApiResponse>({ error: "Draft not found" }, { status: 404 });
    }

    await prisma.recoveredDraft.delete({ where: { id: params.id } });

    return NextResponse.json<ApiResponse>({ message: "Draft deleted" });
  } catch (err) {
    console.error("[DELETE /api/drafts/[id]]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
