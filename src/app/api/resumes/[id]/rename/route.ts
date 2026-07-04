import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

const schema = z.object({
  title: z.string().min(1).max(100),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid title" }, { status: 400 });
  }

  const updated = await prisma.resume.update({
    where: { id },
    data: { title: parsed.data.title },
    select: { id: true, title: true },
  });

  return NextResponse.json<ApiResponse<{ id: string; title: string }>>({ data: updated });
}
