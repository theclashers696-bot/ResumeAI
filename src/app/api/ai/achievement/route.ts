import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/gemini";
import { buildAchievementPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import type { ApiResponse } from "@/types";

const bodySchema = z.object({
  context: z.string().min(3).max(1000),
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
    const prompt = buildAchievementPrompt(promptInput);
    const achievement = await generateText(prompt, { maxOutputTokens: 200 });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "ACHIEVEMENT_WRITE",
      prompt,
      input: promptInput,
      output: { achievement },
    });

    return NextResponse.json<ApiResponse<{ achievement: string }>>({ data: { achievement: achievement.trim() } });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/achievement");
  }
}
