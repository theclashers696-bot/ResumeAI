import { NextResponse } from "next/server";
import { getCreditStatus } from "@/lib/ai/credits";
import { requireSession, unauthorized } from "@/lib/ai/route-helpers";
import type { ApiResponse } from "@/types";

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const status = await getCreditStatus(session.user.id);
    return NextResponse.json<ApiResponse>({ data: status });
  } catch (err) {
    console.error("[GET /api/ai/credits]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
