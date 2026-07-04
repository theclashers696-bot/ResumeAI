import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category") ?? "all";

    if (!query || query.length < 2) {
      return NextResponse.json<ApiResponse>({ data: { results: [], query } });
    }

    const userId = session.user.id;

    // Rate limit: 60 searches per user per minute
    const rl = checkRateLimit(`search:${userId}`, { windowMs: 60_000, max: 60 });
    if (!rl.allowed) {
      return NextResponse.json<ApiResponse>(
        { error: "Too many search requests. Please slow down." },
        { status: 429 },
      );
    }

    const q = query.toLowerCase();

    const [resumes, coverLetters, imports, aiHistory] = await Promise.all([
      (category === "all" || category === "resumes")
        ? prisma.resume.findMany({
            where: {
              userId,
              isArchived: false,
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { fullName: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                { headline: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, title: true, slug: true, updatedAt: true, template: true },
            take: 5,
          })
        : Promise.resolve([]),

      (category === "all" || category === "cover-letters")
        ? prisma.coverLetter.findMany({
            where: {
              userId,
              OR: [
                { jobTitle: { contains: q, mode: "insensitive" } },
                { company: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
              ],
            },
            select: { id: true, jobTitle: true, company: true, createdAt: true },
            take: 5,
          })
        : Promise.resolve([]),

      (category === "all" || category === "imports")
        ? prisma.resumeImport.findMany({
            where: {
              userId,
              fileName: { contains: q, mode: "insensitive" },
            },
            select: { id: true, fileName: true, fileType: true, status: true, createdAt: true },
            take: 5,
          })
        : Promise.resolve([]),

      (category === "all" || category === "ai-history")
        ? prisma.aIGeneration.findMany({
            where: {
              userId,
              OR: [
                { prompt: { contains: q, mode: "insensitive" } },
                { feature: { equals: q.toUpperCase() as never } },
              ],
            },
            select: { id: true, feature: true, prompt: true, createdAt: true, status: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          })
        : Promise.resolve([]),
    ]);

    const results = {
      resumes: resumes.map((r) => ({
        type: "resume" as const,
        id: r.id,
        title: r.title,
        subtitle: r.template,
        href: `/resumes/${r.id}`,
        date: r.updatedAt,
      })),
      coverLetters: coverLetters.map((c) => ({
        type: "cover-letter" as const,
        id: c.id,
        title: `${c.jobTitle} @ ${c.company}`,
        subtitle: "Cover Letter",
        href: `/cover-letters`,
        date: c.createdAt,
      })),
      imports: imports.map((i) => ({
        type: "import" as const,
        id: i.id,
        title: i.fileName,
        subtitle: `${i.fileType.toUpperCase()} · ${i.status}`,
        href: `/import/${i.id}`,
        date: i.createdAt,
      })),
      aiHistory: aiHistory.map((a) => ({
        type: "ai-history" as const,
        id: a.id,
        title: a.feature.replace(/_/g, " "),
        subtitle: a.prompt.slice(0, 80),
        href: `/ai-studio#history`,
        date: a.createdAt,
      })),
    };

    const totalCount =
      results.resumes.length +
      results.coverLetters.length +
      results.imports.length +
      results.aiHistory.length;

    if (query.length >= 3) {
      await prisma.searchHistory
        .create({
          data: { userId, query, category: category === "all" ? null : category, resultCount: totalCount },
        })
        .catch(() => undefined);
    }

    return NextResponse.json<ApiResponse>({ data: { results, query, total: totalCount } });
  } catch (err) {
    console.error("[GET /api/search]", err);
    return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
  }
}

