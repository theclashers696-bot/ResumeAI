import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateJSON } from "@/lib/ai/gemini";
import { buildSkillsSuggestPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import type { ApiResponse } from "@/types";

const bodySchema = z.object({
  jobTitle: z.string().min(2).max(120),
  existingSkills: z.string().max(1000).optional().default(""),
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
    const prompt = buildSkillsSuggestPrompt(promptInput);
    const skills = await generateJSON<string[]>(prompt);

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "SKILLS_SUGGEST",
      prompt,
      input: promptInput,
      output: { skills },
    });

    return NextResponse.json<ApiResponse<{ skills: string[] }>>({ data: { skills } });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/skills-suggest");
  }
}
