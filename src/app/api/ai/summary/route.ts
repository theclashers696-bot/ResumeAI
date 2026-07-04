import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/gemini";
import { buildSummaryPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import type { ApiResponse } from "@/types";

const bodySchema = z.object({
  jobTitle: z.string().min(2).max(120),
  yearsOfExperience: z.string().min(1).max(40),
  keySkills: z.string().min(1).max(500),
  tone: z.string().min(1).max(40).default("professional"),
  resumeId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json<ApiResponse>({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { resumeId, ...promptInput } = parsed.data;
    const prompt = buildSummaryPrompt(promptInput);
    const summary = await generateText(prompt, { maxOutputTokens: 400 });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "SUMMARY_GENERATE",
      prompt,
      input: promptInput,
      output: { summary },
    });

    return NextResponse.json<ApiResponse<{ summary: string }>>({ data: { summary: summary.trim() } });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/summary");
  }
}
