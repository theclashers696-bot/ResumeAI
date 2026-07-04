import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildExperienceBulletsPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import type { ApiResponse } from "@/types";

const bodySchema = z.object({
  position: z.string().min(1).max(120),
  company: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  count: z.number().int().min(1).max(8).default(4),
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
    const prompt = buildExperienceBulletsPrompt(promptInput);
    const bullets = await generateJSON<string[]>(prompt);

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "EXPERIENCE_BULLETS",
      prompt,
      input: promptInput,
      output: { bullets },
    });

    return NextResponse.json<ApiResponse<{ bullets: string[] }>>({ data: { bullets } });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/experience-bullets");
  }
}
