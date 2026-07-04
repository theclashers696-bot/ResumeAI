import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildCareerIntelligencePrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const bodySchema = z.object({ resumeId: z.string().min(1) });

interface CareerIntelligenceResult {
  currentRole: string;
  experienceLevel: string;
  careerPaths: Array<{
    title: string;
    description: string;
    salaryRange: { min: number; max: number; currency: string };
    yearsToAchieve: string;
    requiredSkills: string[];
    difficulty: string;
  }>;
  currentSalaryRange: { min: number; max: number; currency: string; level: string };
  popularSkills: string[];
  trendingTechnologies: string[];
  suggestedCertifications: Array<{ name: string; provider: string; priority: string; reason: string }>;
  learningRoadmap: Array<{ step: number; title: string; description: string; timeframe: string; skills: string[] }>;
}

function resumeToText(resume: {
  fullName: string | null; headline: string | null; summary: string | null;
  workExperiences: { position: string; company: string; description: string | null; achievements: unknown }[];
  educations: { degree: string; institution: string; fieldOfStudy: string | null }[];
  skills: { name: string }[];
  certifications: { name: string; issuer: string }[];
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
  lines.push(`Certifications: ${resume.certifications.map((c) => c.name).join(", ")}`);
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

    const { resumeId } = parsed.data;

    const cached = await prisma.careerSuggestion.findFirst({
      where: { resumeId, userId: session.user.id, createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } },
      orderBy: { createdAt: "desc" },
    });
    if (cached) return NextResponse.json<ApiResponse>({ data: cached });

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: session.user.id },
      include: {
        workExperiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
      },
    });

    if (!resume) return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });

    const resumeText = resumeToText(resume);
    const prompt = buildCareerIntelligencePrompt(resumeText);
    const result = await generateJSON<CareerIntelligenceResult>(prompt);

    const suggestion = await prisma.careerSuggestion.create({
      data: {
        userId: session.user.id,
        resumeId,
        careerPaths: result.careerPaths as unknown as Prisma.InputJsonValue,
        salaryRange: result.currentSalaryRange as unknown as Prisma.InputJsonValue,
        popularSkills: result.popularSkills as unknown as Prisma.InputJsonValue,
        trendingTech: result.trendingTechnologies as unknown as Prisma.InputJsonValue,
        certifications: result.suggestedCertifications as unknown as Prisma.InputJsonValue,
        learningRoadmap: result.learningRoadmap as unknown as Prisma.InputJsonValue,
      },
    });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "CAREER_INTELLIGENCE",
      prompt,
      output: { suggestionId: suggestion.id },
    });

    return NextResponse.json<ApiResponse>({ data: { ...suggestion, currentRole: result.currentRole, experienceLevel: result.experienceLevel } });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/career-intelligence");
  }
}
