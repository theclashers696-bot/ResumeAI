import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

const patchSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  jobTitle: z.string().min(1).max(160).optional(),
  company: z.string().min(1).max(160).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const item = await prisma.coverLetter.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!item) return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });
  return NextResponse.json<ApiResponse>({ data: item });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    const updated = await prisma.coverLetter.updateMany({
      where: { id: params.id, userId: session.user.id },
      data: parsed.data,
    });
    if (updated.count === 0) return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });

    const item = await prisma.coverLetter.findUnique({ where: { id: params.id } });
    return NextResponse.json<ApiResponse>({ data: item });
  } catch (err) {
    console.error("[PATCH /api/cover-letters/[id]]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const deleted = await prisma.coverLetter.deleteMany({
      where: { id: params.id, userId: session.user.id },
    });
    if (deleted.count === 0) return NextResponse.json<ApiResponse>({ error: "Not found" }, { status: 404 });
    return NextResponse.json<ApiResponse>({ message: "Deleted" });
  } catch (err) {
    console.error("[DELETE /api/cover-letters/[id]]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
