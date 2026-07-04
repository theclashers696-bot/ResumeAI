import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse, ChartDataPoint } from "@/types";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [resumes, downloadActivities] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: session.user.id, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.resumeActivity.findMany({
      where: {
        userId: session.user.id,
        action: "RESUME_DOWNLOADED",
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true },
    }),
  ]);

  const months: ChartDataPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      month: d.toLocaleDateString("en-US", { month: "short" }),
      resumes: 0,
      downloads: 0,
    });
  }

  const getKey = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short" });

  const monthSet = new Set(months.map((m) => m.month));

  for (const r of resumes) {
    const key = getKey(new Date(r.createdAt));
    if (monthSet.has(key)) {
      const m = months.find((x) => x.month === key);
      if (m) m.resumes++;
    }
  }

  for (const d of downloadActivities) {
    const key = getKey(new Date(d.createdAt));
    if (monthSet.has(key)) {
      const m = months.find((x) => x.month === key);
      if (m) m.downloads++;
    }
  }

  return NextResponse.json<ApiResponse<ChartDataPoint[]>>({ data: months });
}
