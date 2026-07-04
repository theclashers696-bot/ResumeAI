import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildInterviewPrepPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const bodySchema = z.object({
  resumeId: z.string().min(1),
  jobTitle: z.string().min(1).max(100),
});

interface InterviewPrepResult {
  jobTitle: string;
  technical: Array<{ question: string; answer: string; difficulty: string; tip: string }>;
  behavioral: Array<{ question: string; answer: string; framework: string; competency: string }>;
  hr: Array<{ question: string; answer: string }>;
}

function resumeToText(resume: {
  fullName: string | null; headline: string | null; summary: string | null;
  workExperiences: { position: string; company: string; description: string | null; achievements: unknown }[];
  educations: { degree: string; institution: string }[];
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
  for (const e of resume.educations) lines.push(`- ${e.degree} at ${e.institution}`);
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

    const { resumeId, jobTitle } = parsed.data;

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

    const resumeText = resumeToText(resume);
    const prompt = buildInterviewPrepPrompt({ resumeText, jobTitle });
    const result = await generateJSON<InterviewPrepResult>(prompt);

    const prep = await prisma.interviewPrep.create({
      data: {
        userId: session.user.id,
        resumeId,
        jobTitle,
        technical: result.technical as unknown as Prisma.InputJsonValue,
        behavioral: result.behavioral as unknown as Prisma.InputJsonValue,
        hr: result.hr as unknown as Prisma.InputJsonValue,
      },
    });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "INTERVIEW_PREP",
      prompt,
      output: { prepId: prep.id, jobTitle },
    });

    return NextResponse.json<ApiResponse>({ data: prep });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/interview-prep");
  }
}
