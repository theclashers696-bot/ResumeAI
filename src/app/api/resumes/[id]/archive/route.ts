import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json()) as { isArchived?: boolean };
  const isArchived = typeof body.isArchived === "boolean" ? body.isArchived : !resume.isArchived;

  const updated = await prisma.resume.update({
    where: { id },
    data: { isArchived },
    select: { id: true, isArchived: true },
  });

  return NextResponse.json<ApiResponse<{ id: string; isArchived: boolean }>>({ data: updated });
}
