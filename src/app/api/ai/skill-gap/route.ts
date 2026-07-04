import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildSkillGapPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const bodySchema = z.object({
  resumeId: z.string().min(1),
  targetRole: z.string().min(1).max(150),
});

interface SkillGapResult {
  currentLevel: string;
  matchScore: number;
  summary: string;
  missingSkills: Array<{ skill: string; priority: string; reason: string }>;
  courses: Array<{ title: string; provider: string; duration: string; level: string; focus: string }>;
  roadmap: Array<{ step: number; milestone: string; description: string; timeframe: string; skills: string[] }>;
}

function resumeToText(resume: {
  fullName: string | null; headline: string | null; summary: string | null;
  workExperiences: { position: string; company: string; description: string | null }[];
  educations: { degree: string; institution: string; fieldOfStudy: string | null }[];
  skills: { name: string }[];
  certifications: { name: string }[];
}): string {
  const lines: string[] = [];
  if (resume.headline) lines.push(resume.headline);
  if (resume.summary) lines.push(`Summary: ${resume.summary}`);
  lines.push("Experience:");
  for (const w of resume.workExperiences) lines.push(`- ${w.position} at ${w.company}: ${w.description ?? ""}`);
  lines.push("Education:");
  for (const e of resume.educations) lines.push(`- ${e.degree} in ${e.fieldOfStudy ?? ""} at ${e.institution}`);
  lines.push(`Skills: ${resume.skills.map((s) => s.name).join(", ")}`);
  if (resume.certifications.length) lines.push(`Certifications: ${resume.certifications.map((c) => c.name).join(", ")}`);
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

    const { resumeId, targetRole } = parsed.data;

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
    const prompt = buildSkillGapPrompt({ resumeText, targetRole });
    const result = await generateJSON<SkillGapResult>(prompt);

    const gap = await prisma.skillGap.create({
      data: {
        userId: session.user.id,
        resumeId,
        targetRole,
        matchScore: result.matchScore,
        missingSkills: result.missingSkills as unknown as Prisma.InputJsonValue,
        courses: result.courses as unknown as Prisma.InputJsonValue,
        roadmap: result.roadmap as unknown as Prisma.InputJsonValue,
      },
    });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "SKILL_GAP",
      prompt,
      output: { gapId: gap.id, targetRole, matchScore: result.matchScore },
    });

    return NextResponse.json<ApiResponse>({ data: { ...gap, currentLevel: result.currentLevel, summary: result.summary } });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/skill-gap");
  }
}
