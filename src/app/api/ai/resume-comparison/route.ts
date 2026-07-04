import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildResumeComparisonPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const bodySchema = z.object({
  resumeId1: z.string().min(1),
  resumeId2: z.string().min(1),
}).refine((d) => d.resumeId1 !== d.resumeId2, { message: "Cannot compare a resume with itself" });

interface ComparisonResult {
  resume1Score: number;
  resume2Score: number;
  winner: string;
  recommendation: string;
  differences: Array<{ section: string; resume1: string; resume2: string; verdict: string; reason: string }>;
  resume1Strengths: string[];
  resume2Strengths: string[];
  improvements: string[];
}

function resumeToText(resume: {
  title: string;
  fullName: string | null; headline: string | null; summary: string | null;
  workExperiences: { position: string; company: string; description: string | null; achievements: unknown }[];
  educations: { degree: string; institution: string; fieldOfStudy: string | null }[];
  skills: { name: string }[];
  projects: { name: string; description: string | null }[];
}): string {
  const lines: string[] = [`[${resume.title}]`];
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
  for (const p of resume.projects) lines.push(`Project: ${p.name} — ${p.description ?? ""}`);
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

    const { resumeId1, resumeId2 } = parsed.data;

    const include = {
      workExperiences: { orderBy: { order: "asc" as const } },
      educations: { orderBy: { order: "asc" as const } },
      skills: { orderBy: { order: "asc" as const } },
      projects: { orderBy: { order: "asc" as const } },
    };

    const [resume1, resume2] = await Promise.all([
      prisma.resume.findFirst({ where: { id: resumeId1, userId: session.user.id }, include }),
      prisma.resume.findFirst({ where: { id: resumeId2, userId: session.user.id }, include }),
    ]);

    if (!resume1 || !resume2) {
      return NextResponse.json<ApiResponse>({ error: "One or both resumes not found" }, { status: 404 });
    }

    const prompt = buildResumeComparisonPrompt({
      resumeText1: resumeToText(resume1),
      resumeText2: resumeToText(resume2),
    });
    const result = await generateJSON<ComparisonResult>(prompt);

    const comparison = await prisma.resumeComparison.create({
      data: {
        userId: session.user.id,
        resumeId1,
        resumeId2,
        resume1Score: result.resume1Score,
        resume2Score: result.resume2Score,
        winner: result.winner,
        recommendation: result.recommendation,
        differences: result.differences as unknown as Prisma.InputJsonValue,
        improvements: result.improvements as unknown as Prisma.InputJsonValue,
      },
    });

    await chargeAndLog({
      userId: session.user.id,
      feature: "RESUME_COMPARISON",
      prompt,
      output: { comparisonId: comparison.id, winner: result.winner },
    });

    return NextResponse.json<ApiResponse>({
      data: {
        ...comparison,
        resume1Title: resume1.title,
        resume2Title: resume2.title,
        resume1Strengths: result.resume1Strengths,
        resume2Strengths: result.resume2Strengths,
      },
    });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/resume-comparison");
  }
}
