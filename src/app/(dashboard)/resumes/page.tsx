import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ResumeListClient, ResumeListSkeleton } from "@/components/resume/resume-list-client";
import type { ResumeListItem } from "@/types";

export const metadata: Metadata = {
  title: "My Resumes",
};

async function ResumeListServer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
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
  });

  return <ResumeListClient initialResumes={resumes as ResumeListItem[]} />;
}

export default function ResumesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Resumes</h1>
        <p className="mt-1 text-muted-foreground">
          Manage, search, and organize all your resumes in one place.
        </p>
      </div>

      <Suspense fallback={<ResumeListSkeleton />}>
        <ResumeListServer />
      </Suspense>
    </div>
  );
}
