import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateText } from "@/lib/ai/gemini";
import { buildProjectDescriptionPrompt } from "@/lib/ai/prompts";
import { chargeAndLog, handleAIError, requireSession, unauthorized } from "@/lib/ai/route-helpers";
import type { ApiResponse } from "@/types";

const bodySchema = z.object({
  name: z.string().min(1).max(160),
  technologies: z.string().max(400).optional().default(""),
  notes: z.string().max(1500).optional().default(""),
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
    const prompt = buildProjectDescriptionPrompt(promptInput);
    const description = await generateText(prompt, { maxOutputTokens: 300 });

    await chargeAndLog({
      userId: session.user.id,
      resumeId,
      feature: "PROJECT_DESCRIBE",
      prompt,
      input: promptInput,
      output: { description },
    });

    return NextResponse.json<ApiResponse<{ description: string }>>({ data: { description: description.trim() } });
  } catch (err) {
    return handleAIError(err, "POST /api/ai/project-description");
  }
}
