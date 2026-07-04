import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildResumeHealthPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const bodySchema = z.object({
  resumeId: z.string().min(1),
});

interface ResumeHealthResult {
  overallScore: number;
  formattingScore: number;
  contentScore: number;
  keywordScore: number;
  grammarScore: number;
  readabilityScore: number;
  recruiterScore: number;
  weakSections: Array<{ section: string; issue: string; fix: string }>;
  strongSections: string[];
  longSentences: string[];
  passiveVoice: string[];
  actionVerbsUsed: string[];
  buzzwords: string[];
  grammarIssues: string[];
  suggestions: string[];
}

function resumeToText(resume: {
  fullName: string | null;
  headline: string | null;
  summary: string | null;
  workExperiences: { position: string; company: string; description: string | null; achievements: unknown }[];
  educations: { degree: string; institution: string; fieldOfStudy: string | null }[];
  skills: { name: string }[];
  projects: { name: string; description: string | null }[];
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
  lines.push("Projects:");
  for (const p of resume.projects) lines.push(`- ${p.name}: ${p.description ?? ""}`);
  lines.push("Certifications:");
  for (const c of resume.certifications) lines.push(`- ${c.name} by ${c.issuer}`);
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

    // Check cache — re-use result from last 24h
    const cached = await prisma.resumeHealth.findFirst({
      where: {
        resumeId,
        userId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: "desc" },
    });
    if (cached) {
      return NextResponse.json<ApiResponse>({ data: cached });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: session.user.id },
      include: {
        workExperiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
      },
    });

    if (!resume) return NextResponse.json<ApiResponse>({ error: "Resume not found" }, { status: 404 });

    const resumeText = resumeToText(resume);
    const prompt = buildResumeHealthPrompt(resumeText);
    const result = await generateJSON<ResumeHealthResult>(prompt);

    const health = await prisma.resumeHealth.create({
      data: {
        userId: session.user.id,
        resumeId,
        overallScore: result.overallScore,
        formattingScore: result.formattingScore,
        contentScore: result.contentScore,
        keywordScore: result.keywordScore,
        grammarScore: result.grammarScore,
        readabilityScore: result.readabilityScore,
        recruiterScore: result.recruiterScore,
        weakSections: result.weakSections as unknown as Prisma.InputJsonValue,
        strongSections: result.strongSections as unknown as Prisma.InputJsonValue,
        longSentences: result.longSentences as unknown as Prisma.InputJsonValue,
        passiveVoice: result.passiveVoice as unknown as Prisma.InputJsonValue,
        actionVerbsUsed: result.actionVerbsUsed as unknown as Prisma.InputJsonValue,
        buzzwords: result.buzzwords as unknown as Prisma.InputJsonValue,
        grammarIssues: result.grammarIssues as unknown as Prisma.InputJsonValue,
        suggestions: result.suggestions as unknown as Prisma.InputJsonValue,
      },
    });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "RESUME_HEALTH",
      prompt,
      output: { healthId: health.id, overallScore: result.overallScore },
    });

    return NextResponse.json<ApiResponse>({ data: health });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/resume-health");
  }
}
