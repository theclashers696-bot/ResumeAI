import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AnalyticsDashboard } from "@/components/resume/analytics-dashboard";

export const metadata: Metadata = {
  title: "Resume Analytics — ResumeAI",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AnalyticsPage({ params }: Props) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) notFound();

  const { id } = await params;

  const resume = await prisma.resume.findUnique({
    where: { id, userId: session.user.id },
    select: { id: true, title: true, slug: true, isPublic: true, viewCount: true, downloadCount: true },
  });

  if (!resume) notFound();

  return <AnalyticsDashboard resumeId={resume.id} resumeTitle={resume.title} resumeSlug={resume.slug} isPublic={resume.isPublic} />;
}
