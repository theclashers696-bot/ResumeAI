import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") ?? "30", 10);

    const resume = await prisma.resume.findUnique({
      where: { id, userId: session.user.id },
      select: { id: true, title: true, viewCount: true, downloadCount: true },
    });

    if (!resume) {
      return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });
    }

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [views, downloads, shareLinks] = await Promise.all([
      prisma.resumeView.findMany({
        where: { resumeId: id, createdAt: { gte: since } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.download.findMany({
        where: { resumeId: id, createdAt: { gte: since } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.shareLink.findMany({
        where: { resumeId: id, userId: session.user.id },
        select: { id: true, label: true, token: true, viewCount: true, isActive: true, createdAt: true },
      }),
    ]);

    // Build timeline: group views by date
    const viewsByDate: Record<string, number> = {};
    const downloadsByDate: Record<string, number> = {};

    views.forEach((v) => {
      const d = v.createdAt.toISOString().slice(0, 10);
      viewsByDate[d] = (viewsByDate[d] ?? 0) + 1;
    });

    downloads.forEach((d) => {
      const date = d.createdAt.toISOString().slice(0, 10);
      downloadsByDate[date] = (downloadsByDate[date] ?? 0) + 1;
    });

    // Generate date range
    const timeline: Array<{ date: string; views: number; downloads: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      timeline.push({
        date: dateStr,
        views: viewsByDate[dateStr] ?? 0,
        downloads: downloadsByDate[dateStr] ?? 0,
      });
    }

    // Device breakdown
    const deviceCounts: Record<string, number> = {};
    views.forEach((v) => {
      const device = v.device ?? "Unknown";
      deviceCounts[device] = (deviceCounts[device] ?? 0) + 1;
    });

    // Country breakdown
    const countryCounts: Record<string, number> = {};
    views.forEach((v) => {
      const country = v.country ?? "Unknown";
      countryCounts[country] = (countryCounts[country] ?? 0) + 1;
    });

    // Referrer breakdown
    const referrerCounts: Record<string, number> = {};
    views.forEach((v) => {
      const ref = v.referrer ?? "Direct";
      referrerCounts[ref] = (referrerCounts[ref] ?? 0) + 1;
    });

    // Download format breakdown
    const formatCounts: Record<string, number> = {};
    downloads.forEach((d) => {
      formatCounts[d.format] = (formatCounts[d.format] ?? 0) + 1;
    });

    const data = {
      summary: {
        totalViews: resume.viewCount,
        totalDownloads: resume.downloadCount,
        recentViews: views.length,
        recentDownloads: downloads.length,
      },
      timeline,
      devices: Object.entries(deviceCounts).map(([name, value]) => ({ name, value })),
      countries: Object.entries(countryCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10),
      referrers: Object.entries(referrerCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      formats: Object.entries(formatCounts).map(([name, value]) => ({ name, value })),
      shareLinks,
    };

    return NextResponse.json<ApiResponse>({ data });
  } catch (error) {
    console.error("[GET /api/resumes/[id]/analytics]", error);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}
