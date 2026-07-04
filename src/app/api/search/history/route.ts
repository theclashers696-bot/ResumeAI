import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

export async function GET(_request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await prisma.searchHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const unique = Array.from(
      new Map(history.map((h) => [h.query, h])).values()
    );

    return NextResponse.json<ApiResponse>({ data: unique });
  } catch (err) {
    console.error("[GET /api/search/history]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
