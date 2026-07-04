import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildJobMatchPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const bodySchema = z.object({
  resumeId: z.string().min(1),
  jobTitle: z.string().min(2).max(160),
  company: z.string().max(160).optional().default(""),
  jobDescription: z.string().min(20).max(6000),
});

interface JobMatchResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { resumeId, jobTitle, company, jobDescription } = parsed.data;

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: session.user.id },
      include: {
        workExperiences: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
      },
    });

    if (!resume) return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });

    const resumeText = [
      resume.summary ?? "",
      ...resume.workExperiences.map((w) => `${w.position} at ${w.company}: ${w.description ?? ""}`),
      `Skills: ${resume.skills.map((s) => s.name).join(", ")}`,
      ...resume.projects.map((p) => `${p.name}: ${p.description ?? ""}`),
    ].join("\n");

    const prompt = buildJobMatchPrompt({ resumeText, jobDescription });
    const result = await generateJSON<JobMatchResult>(prompt);

    const match = await prisma.jobMatch.create({
      data: {
        userId: session.user.id,
        resumeId,
        jobTitle,
        company: company || null,
        jobDescription,
        matchScore: result.matchScore,
        matchedSkills: result.matchedSkills as unknown as Prisma.InputJsonValue,
        missingSkills: result.missingSkills as unknown as Prisma.InputJsonValue,
        recommendations: result.recommendations as unknown as Prisma.InputJsonValue,
      },
    });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "JOB_MATCH",
      prompt,
      input: { jobTitle, company, jobDescription },
      output: { jobMatchId: match.id },
    });

    return NextResponse.json<ApiResponse>({ data: match });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/job-match");
  }
}
