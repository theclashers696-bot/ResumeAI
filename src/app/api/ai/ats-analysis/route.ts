import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildATSAnalysisPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const bodySchema = z.object({
  resumeId: z.string().min(1),
  jobDescription: z.string().max(6000).optional().default(""),
});

interface ATSResult {
  score: number;
  summary: string;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestions: string[];
}

function resumeToPlainText(resume: {
  fullName: string | null;
  headline: string | null;
  summary: string | null;
  workExperiences: { position: string; company: string; description: string | null; achievements: unknown }[];
  educations: { degree: string; institution: string; fieldOfStudy: string | null }[];
  skills: { name: string }[];
  projects: { name: string; description: string | null }[];
}): string {
  const lines: string[] = [];
  if (resume.fullName) lines.push(resume.fullName);
  if (resume.headline) lines.push(resume.headline);
  if (resume.summary) lines.push(`Summary: ${resume.summary}`);

  lines.push("Experience:");
  for (const w of resume.workExperiences) {
    lines.push(`- ${w.position} at ${w.company}: ${w.description ?? ""}`);
    if (Array.isArray(w.achievements)) {
      for (const a of w.achievements as string[]) lines.push(`  * ${a}`);
    }
  }

  lines.push("Education:");
  for (const e of resume.educations) lines.push(`- ${e.degree} in ${e.fieldOfStudy ?? ""} at ${e.institution}`);

  lines.push(`Skills: ${resume.skills.map((s) => s.name).join(", ")}`);

  lines.push("Projects:");
  for (const p of resume.projects) lines.push(`- ${p.name}: ${p.description ?? ""}`);

  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { resumeId, jobDescription } = parsed.data;

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: session.user.id },
      include: {
        workExperiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
      },
    });

    if (!resume) return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });

    const resumeText = resumeToPlainText(resume);
    const prompt = buildATSAnalysisPrompt({ resumeText, jobDescription });
    const result = await generateJSON<ATSResult>(prompt);

    const analysis = await prisma.aTSAnalysis.create({
      data: {
        userId: session.user.id,
        resumeId,
        jobDescription: jobDescription || null,
        score: result.score,
        keywordsFound: result.keywordsFound as unknown as Prisma.InputJsonValue,
        keywordsMissing: result.keywordsMissing as unknown as Prisma.InputJsonValue,
        suggestions: result.suggestions as unknown as Prisma.InputJsonValue,
        summary: result.summary,
      },
    });

    await prisma.resume.update({ where: { id: resumeId }, data: { atsScore: result.score } });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "ATS_ANALYSIS",
      prompt,
      input: { jobDescription },
      output: { analysisId: analysis.id },
    });

    return NextResponse.json<ApiResponse>({ data: analysis });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/ats-analysis");
  }
}
