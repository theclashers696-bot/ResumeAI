import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/gemini";
import { buildCoverLetterPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

const bodySchema = z.object({
  jobTitle: z.string().min(2).max(160),
  company: z.string().min(1).max(160),
  jobDescription: z.string().max(4000).optional().default(""),
  tone: z.string().min(1).max(40).default("professional"),
  candidateSummary: z.string().max(2000).optional().default(""),
  resumeId: z.string().optional(),
});

export async function GET() {
  const session = await requireSession();
  if (!session) return unauthorized();

  const letters = await prisma.coverLetter.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return NextResponse.json<ApiResponse>({ data: letters });
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
    const prompt = buildCoverLetterPrompt(promptInput);
    const content = await generateText(prompt, { maxOutputTokens: 900 });

    const letter = await prisma.coverLetter.create({
      data: {
        userId: session.user.id,
        resumeId,
        jobTitle: promptInput.jobTitle,
        company: promptInput.company,
        jobDescription: promptInput.jobDescription,
        tone: promptInput.tone,
        content: content.trim(),
      },
    });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "COVER_LETTER",
      prompt,
      input: promptInput,
      output: { coverLetterId: letter.id },
    });

    return NextResponse.json<ApiResponse>({ data: letter });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/cover-letter");
  }
}
