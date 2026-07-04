import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DesignStudioClient } from "./design-studio-client";

export const metadata = { title: "Design Studio — ResumeAI" };

export default async function DesignPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id, isArchived: false },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, template: true, themeColor: true, updatedAt: true },
  });

  return <DesignStudioClient resumes={resumes} />;
}
