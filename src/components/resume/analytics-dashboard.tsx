"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft, Eye, Download, Globe, Smartphone, Monitor, Loader2,
  TrendingUp, Link2, BarChart3, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  summary: {
    totalViews: number;
    totalDownloads: number;
    recentViews: number;
    recentDownloads: number;
  };
  timeline: Array<{ date: string; views: number; downloads: number }>;
  devices: Array<{ name: string; value: number }>;
  countries: Array<{ name: string; value: number }>;
  referrers: Array<{ name: string; value: number }>;
  formats: Array<{ name: string; value: number }>;
  shareLinks: Array<{
    id: string;
    label: string;
    token: string;
    viewCount: number;
    isActive: boolean;
    createdAt: string;
  }>;
}

interface AnalyticsDashboardProps {
  resumeId: string;
  resumeTitle: string;
  resumeSlug: string;
  isPublic: boolean;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

const DAY_OPTIONS = [7, 14, 30, 90] as const;

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub?: string;
  color?: "blue" | "green" | "amber" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950",
    green: "bg-green-50 text-green-600 dark:bg-green-950",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950",
  };

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{value.toLocaleString()}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboard({ resumeId, resumeTitle, resumeSlug, isPublic }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(30);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await fetch(`/api/resumes/${resumeId}/analytics?days=${days}`);
      const j = await r.json() as { data?: AnalyticsData; error?: string };
      if (j.error) { setError(j.error); return; }
      setData(j.data ?? null);
    } catch {
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, [resumeId, days]);

  useEffect(() => { void load(); }, [load]);

  // Abbreviate timeline dates
  const chartData = (data?.timeline ?? []).map((d) => ({
    ...d,
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href={`/resumes/${resumeId}/edit`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold">{resumeTitle}</h1>
            <p className="text-xs text-muted-foreground">Analytics</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { void load(); }} title="Refresh">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 p-4 pt-6">
        {/* Day range selector */}
        <div className="flex items-center gap-2">
          {DAY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                days === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {d}d
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">{error}</div>
        ) : data ? (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard icon={Eye} label="Total Views" value={data.summary.totalViews} sub="All time" color="blue" />
              <StatCard icon={Download} label="Total Downloads" value={data.summary.totalDownloads} sub="All time" color="green" />
              <StatCard icon={TrendingUp} label={`Views (${days}d)`} value={data.summary.recentViews} color="amber" />
              <StatCard icon={BarChart3} label={`Downloads (${days}d)`} value={data.summary.recentDownloads} color="purple" />
            </div>

            {/* Timeline chart */}
            {chartData.length > 0 && (
              <div className="rounded-xl border border-border bg-background p-5">
                <h2 className="mb-4 text-sm font-semibold">Views & Downloads Over Time</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} dot={false} name="Views" />
                    <Line type="monotone" dataKey="downloads" stroke="#10B981" strokeWidth={2} dot={false} name="Downloads" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Devices */}
              {data.devices.length > 0 && (
                <div className="rounded-xl border border-border bg-background p-5">
                  <h2 className="mb-4 text-sm font-semibold">Devices</h2>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={data.devices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${name} ${Math.round((percent as number) * 100)}%`} labelLine={false} fontSize={11}>
                        {data.devices.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex justify-center gap-4">
                    {data.devices.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {d.name === "Desktop" ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                        {d.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Countries */}
              {data.countries.length > 0 && (
                <div className="rounded-xl border border-border bg-background p-5">
                  <h2 className="mb-4 text-sm font-semibold">
                    <Globe className="mr-1.5 inline h-4 w-4 text-muted-foreground" />
                    Top Countries
                  </h2>
                  <div className="space-y-2">
                    {data.countries.slice(0, 6).map((c, i) => {
                      const max = data.countries[0]?.value ?? 1;
                      return (
                        <div key={c.name} className="flex items-center gap-2">
                          <span className="w-4 text-xs text-muted-foreground">{i + 1}</span>
                          <span className="min-w-0 flex-1 truncate text-xs">{c.name}</span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${(c.value / max) * 100}%` }} />
                          </div>
                          <span className="w-6 text-right text-xs text-muted-foreground">{c.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Download formats */}
              {data.formats.length > 0 && (
                <div className="rounded-xl border border-border bg-background p-5">
                  <h2 className="mb-4 text-sm font-semibold">Download Formats</h2>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={data.formats}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                      <Bar dataKey="value" name="Downloads" radius={[4, 4, 0, 0]}>
                        {data.formats.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Referrers */}
            {data.referrers.length > 0 && (
              <div className="rounded-xl border border-border bg-background p-5">
                <h2 className="mb-4 text-sm font-semibold">Traffic Sources</h2>
                <div className="space-y-2">
                  {data.referrers.slice(0, 8).map((r) => {
                    const max = data.referrers[0]?.value ?? 1;
                    return (
                      <div key={r.name} className="flex items-center gap-3">
                        <span className="min-w-0 flex-1 truncate text-xs">{r.name}</span>
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary/60" style={{ width: `${(r.value / max) * 100}%` }} />
                        </div>
                        <span className="w-8 text-right text-xs text-muted-foreground">{r.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Share links performance */}
            {data.shareLinks.length > 0 && (
              <div className="rounded-xl border border-border bg-background p-5">
                <h2 className="mb-4 text-sm font-semibold">
                  <Link2 className="mr-1.5 inline h-4 w-4 text-muted-foreground" />
                  Share Links Performance
                </h2>
                <div className="space-y-2">
                  {data.shareLinks.map((l) => (
                    <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{l.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {typeof window !== "undefined" ? window.location.origin : ""}/share/{l.token}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium tabular-nums">{l.viewCount}</span>
                      </div>
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        l.isActive ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                      )}>
                        {l.isActive ? "Active" : "Off"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {data.summary.totalViews === 0 && data.summary.totalDownloads === 0 && (
              <div className="rounded-xl border border-border bg-background py-16 text-center">
                <BarChart3 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm font-medium">No data yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Share your resume to start collecting analytics.
                  {!isPublic && " Make it public or create share links."}
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link href={`/resumes/${resumeId}/edit`}>
                    <Button variant="outline" size="sm">Back to editor</Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
