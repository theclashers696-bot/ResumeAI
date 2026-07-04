import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  FileText,
  Download,
  BarChart3,
  Sparkles,
  Star,
  Plus,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { ResumeCharts } from "@/components/dashboard/resume-charts";
import { ActivityFeed, type SerializedActivityItem } from "@/components/dashboard/activity-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ResumeCard } from "@/components/resume/resume-card";
import type { ResumeListItem, ChartDataPoint } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

function getMonthKey(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short" });
}

function buildChartData(
  resumes: { createdAt: Date }[],
  downloads: { createdAt: Date }[]
): ChartDataPoint[] {
  const months: ChartDataPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ month: getMonthKey(d), resumes: 0, downloads: 0 });
  }

  const currentMonthKeys = new Set(months.map((m) => m.month));

  for (const r of resumes) {
    const key = getMonthKey(new Date(r.createdAt));
    if (currentMonthKeys.has(key)) {
      const m = months.find((x) => x.month === key);
      if (m) m.resumes++;
    }
  }

  for (const d of downloads) {
    const key = getMonthKey(new Date(d.createdAt));
    if (currentMonthKeys.has(key)) {
      const m = months.find((x) => x.month === key);
      if (m) m.downloads++;
    }
  }

  return months;
}

async function DashboardContent() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [resumeStats, recentResumes, activities, downloadActivities] = await Promise.all([
    prisma.resume.aggregate({
      where: { userId: session.user.id, isArchived: false },
      _count: { id: true },
      _sum: { downloadCount: true, aiCreditsUsed: true },
      _avg: { atsScore: true },
    }),
    prisma.resume.findMany({
      where: { userId: session.user.id, isArchived: false },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        isPublic: true,
        template: true,
        thumbnailUrl: true,
        atsScore: true,
        isFavorite: true,
        isArchived: true,
        downloadCount: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.resumeActivity.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        resume: { select: { id: true, title: true } },
      },
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

  const favoriteCount = await prisma.resume.count({
    where: { userId: session.user.id, isFavorite: true },
  });

  const allResumesForChart = await prisma.resume.findMany({
    where: { userId: session.user.id, createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  const chartData = buildChartData(allResumesForChart, downloadActivities);

  const serializedActivities = activities.map((a: (typeof activities)[number]) => ({
    id: a.id,
    userId: a.userId,
    resumeId: a.resumeId,
    action: a.action,
    metadata: a.metadata,
    createdAt: a.createdAt.toISOString(),
    resume: a.resume ? { id: a.resume.id, title: a.resume.title } : null,
  }));

  const stats = [
    {
      title: "Total Resumes",
      value: resumeStats._count.id,
      icon: <FileText className="h-5 w-5" />,
      description: "Active resumes in your account",
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    {
      title: "PDF Downloads",
      value: resumeStats._sum.downloadCount ?? 0,
      icon: <Download className="h-5 w-5" />,
      description: "Total times downloaded",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      title: "Avg ATS Score",
      value: resumeStats._avg.atsScore
        ? `${Math.round(resumeStats._avg.atsScore)}/100`
        : "N/A",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Across all active resumes",
      gradient: "bg-gradient-to-br from-orange-500 to-amber-600",
    },
    {
      title: "AI Credits Used",
      value: resumeStats._sum.aiCreditsUsed ?? 0,
      icon: <Sparkles className="h-5 w-5" />,
      description: "AI enhancements applied",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
    {
      title: "Favorites",
      value: favoriteCount,
      icon: <Star className="h-5 w-5" />,
      description: "Starred resumes",
      gradient: "bg-gradient-to-br from-yellow-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {session.user.name?.split(" ")[0]}! Here&apos;s your overview.
          </p>
        </div>
        <Link href="/resumes/new">
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            New Resume
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} delay={i * 0.07} {...stat} />
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Charts */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Overview</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Last 6 months
          </span>
        </div>
        <ResumeCharts data={chartData} />
      </div>

      {/* Recent resumes + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Resumes</h2>
            <Link href="/resumes" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          {recentResumes.length === 0 ? (
            <Card className="flex min-h-[180px] flex-col items-center justify-center gap-3 border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground/30" />
              <div className="text-center">
                <p className="font-medium">No resumes yet</p>
                <p className="text-sm text-muted-foreground">Create your first resume to get started</p>
              </div>
              <Link href="/resumes/new">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                  Create Resume
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(recentResumes as ResumeListItem[]).map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              <ActivityFeed activities={serializedActivities as SerializedActivityItem[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
        }      take: 10,
      include: {
        resume: { select: { id: true, title: true } },
      },
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

  const favoriteCount = await prisma.resume.count({
    where: { userId: session.user.id, isFavorite: true },
  });

  const allResumesForChart = await prisma.resume.findMany({
    where: { userId: session.user.id, createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true },
  });

  const chartData = buildChartData(allResumesForChart, downloadActivities);

  const serializedActivities = activities.map((a) => ({
    id: a.id,
    userId: a.userId,
    resumeId: a.resumeId,
    action: a.action,
    metadata: a.metadata,
    createdAt: a.createdAt.toISOString(),
    resume: a.resume ? { id: a.resume.id, title: a.resume.title } : null,
  }));

  const stats = [
    {
      title: "Total Resumes",
      value: resumeStats._count.id,
      icon: <FileText className="h-5 w-5" />,
      description: "Active resumes in your account",
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
    },
    {
      title: "PDF Downloads",
      value: resumeStats._sum.downloadCount ?? 0,
      icon: <Download className="h-5 w-5" />,
      description: "Total times downloaded",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      title: "Avg ATS Score",
      value: resumeStats._avg.atsScore
        ? `${Math.round(resumeStats._avg.atsScore)}/100`
        : "N/A",
      icon: <BarChart3 className="h-5 w-5" />,
      description: "Across all active resumes",
      gradient: "bg-gradient-to-br from-orange-500 to-amber-600",
    },
    {
      title: "AI Credits Used",
      value: resumeStats._sum.aiCreditsUsed ?? 0,
      icon: <Sparkles className="h-5 w-5" />,
      description: "AI enhancements applied",
      gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
    },
    {
      title: "Favorites",
      value: favoriteCount,
      icon: <Star className="h-5 w-5" />,
      description: "Starred resumes",
      gradient: "bg-gradient-to-br from-yellow-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, {session.user.name?.split(" ")[0]}! Here&apos;s your overview.
          </p>
        </div>
        <Link href="/resumes/new">
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="h-4 w-4" />
            New Resume
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} delay={i * 0.07} {...stat} />
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Charts */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Overview</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            Last 6 months
          </span>
        </div>
        <ResumeCharts data={chartData} />
      </div>

      {/* Recent resumes + Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Resumes</h2>
            <Link href="/resumes" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>

          {recentResumes.length === 0 ? (
            <Card className="flex min-h-[180px] flex-col items-center justify-center gap-3 border-dashed">
              <FileText className="h-10 w-10 text-muted-foreground/30" />
              <div className="text-center">
                <p className="font-medium">No resumes yet</p>
                <p className="text-sm text-muted-foreground">Create your first resume to get started</p>
              </div>
              <Link href="/resumes/new">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                  Create Resume
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {(recentResumes as ResumeListItem[]).map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
          <Card>
            <CardContent className="p-4">
              <ActivityFeed activities={serializedActivities as SerializedActivityItem[]} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
