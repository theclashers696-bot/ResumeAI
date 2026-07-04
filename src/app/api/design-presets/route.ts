import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import type { ApiResponse } from "@/types";

const presetSchema = z.object({
  name: z.string().min(1).max(80),
  template: z.string().min(1),
  themeJson: z.record(z.unknown()),
});

export async function GET(): Promise<NextResponse<ApiResponse<unknown[]>>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const presets = await prisma.designPreset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: presets });
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<unknown>>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = presetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: "Invalid data" }, { status: 400 });
  }

  const preset = await prisma.designPreset.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      template: parsed.data.template,
      themeJson: parsed.data.themeJson as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json({ success: true, data: preset }, { status: 201 });
}
