import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";

const bodySchema = z.object({
  resumeId: z.string().min(1).max(255),
  shareLinkId: z.string().max(255).optional(),
  referrer: z.string().url().max(2048).optional().or(z.literal("")),
});

function detectDevice(ua: string): string {
  if (/mobile|android|iphone|ipad/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}

// POST – track a resume view (public endpoint, rate-limited by IP)
export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP: 30 tracking calls per minute
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = checkRateLimit(`track:${ip}`, { windowMs: 60_000, max: 30 });
    if (!rl.allowed) {
      return NextResponse.json<ApiResponse>({ error: "Too many requests" }, { status: 429 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>(
        { error: parsed.error.errors[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const { resumeId, shareLinkId, referrer } = parsed.data;

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId, isPublic: true },
      select: { id: true },
    });

    if (!resume) {
      return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });
    }

    const ua = request.headers.get("user-agent") ?? "";

    await Promise.all([
      prisma.resumeView.create({
        data: {
          resumeId,
          shareLinkId: shareLinkId ?? null,
          ip,
          userAgent: ua.slice(0, 512),
          device: detectDevice(ua),
          referrer: referrer ?? request.headers.get("referer") ?? undefined,
        },
      }),
      prisma.resume.update({
        where: { id: resumeId },
        data: { viewCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json<ApiResponse>({ data: { tracked: true } });
  } catch (error) {
    console.error("[POST /api/track]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
