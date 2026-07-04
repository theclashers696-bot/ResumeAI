import { NextRequest, NextResponse } from "next/server";
import { requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  const feature = searchParams.get("feature") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  try {
    const where = {
      userId: session.user.id,
      ...(feature ? { feature: feature as import("@prisma/client").AIFeatureType } : {}),
      ...(search
        ? {
            OR: [
              { prompt: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.aIGeneration.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          feature: true,
          prompt: true,
          input: true,
          output: true,
          status: true,
          createdAt: true,
          resumeId: true,
        },
      }),
      prisma.aIGeneration.count({ where }),
    ]);

    return NextResponse.json<ApiResponse>({
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (err) {
    console.error("[GET /api/ai/history]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
