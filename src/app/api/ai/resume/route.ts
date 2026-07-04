import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildResumeGenerationPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import type { ApiResponse } from "@/types";
import type { Prisma } from "@prisma/client";

const bodySchema = z.object({
  jobTitle: z.string().min(2).max(120),
  yearsOfExperience: z.string().min(1).max(40),
  education: z.string().max(300).optional().default(""),
  keySkills: z.string().min(1).max(500),
  targetCompany: z.string().max(120).optional().default(""),
  country: z.string().max(80).optional().default(""),
  background: z.string().max(3000).optional().default(""),
  resumeId: z.string().optional(),
});

export interface GeneratedResume {
  summary: string;
  workExperiences: {
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }[];
  educations: {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  skills: { name: string; category: string }[];
  projects: { name: string; description: string; technologies: string[] }[];
  certifications: { name: string; issuer: string; issueDate: string }[];
  achievements: { title: string; description: string }[];
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { resumeId, ...promptInput } = parsed.data;
    const prompt = buildResumeGenerationPrompt(promptInput);
    const result = await generateJSON<GeneratedResume>(prompt, { maxOutputTokens: 4096 });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "RESUME_GENERATE",
      prompt,
      input: promptInput,
      output: result as unknown as Prisma.InputJsonValue,
    });

    return NextResponse.json<ApiResponse<GeneratedResume>>({ data: result });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/resume");
  }
}
