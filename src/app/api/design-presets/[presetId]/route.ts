import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

type RouteContext = { params: Promise<{ presetId: string }> };

export async function DELETE(_req: NextRequest, ctx: RouteContext): Promise<NextResponse<ApiResponse<{ ok: boolean }>>> {
  const { presetId } = await ctx.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const preset = await prisma.designPreset.findUnique({ where: { id: presetId }, select: { userId: true } });
  if (!preset || preset.userId !== session.user.id) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  await prisma.designPreset.delete({ where: { id: presetId } });
  return NextResponse.json({ success: true, data: { ok: true } });
}
