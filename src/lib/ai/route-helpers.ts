import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AIServiceError } from "@/lib/ai/gemini";
import { consumeCredit, CreditLimitError } from "@/lib/ai/credits";
import type { ApiResponse } from "@/types";
import type { AIFeatureType, Prisma } from "@prisma/client";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return session;
}

export function unauthorized() {
  return NextResponse.json<ApiResponse>({ error: "Unauthorized" }, { status: 401 });
}

export function handleAIError(err: unknown, routeName: string) {
  console.error(`[${routeName}]`, err);

  if (err instanceof CreditLimitError) {
    return NextResponse.json<ApiResponse>({ error: err.message }, { status: 429 });
  }

  if (err instanceof AIServiceError) {
    const status = err.code === "NO_API_KEY" ? 503 : 502;
    return NextResponse.json<ApiResponse>({ error: err.message }, { status });
  }

  return NextResponse.json<ApiResponse>({ error: "Internal server error" }, { status: 500 });
}

interface LogGenerationInput {
  userId: string;
  resumeId?: string;
  feature: AIFeatureType;
  prompt: string;
  input?: Prisma.InputJsonValue;
  output?: Prisma.InputJsonValue;
  status?: "COMPLETED" | "FAILED";
  errorMessage?: string;
}

/**
 * Consumes one AI credit and logs the generation to AIGeneration history.
 * Call this AFTER a successful Gemini call so failed attempts don't cost
 * the user a credit but ARE still logged for observability.
 */
export async function chargeAndLog(input: LogGenerationInput): Promise<void> {
  if (input.status !== "FAILED") {
    await consumeCredit(input.userId);

    if (input.resumeId) {
      await prisma.resume
        .update({
          where: { id: input.resumeId },
          data: { aiCreditsUsed: { increment: 1 } },
        })
        .catch(() => undefined);
    }
  }

  await prisma.aIGeneration.create({
    data: {
      userId: input.userId,
      resumeId: input.resumeId,
      feature: input.feature,
      prompt: input.prompt,
      input: input.input,
      output: input.output,
      status: input.status ?? "COMPLETED",
      errorMessage: input.errorMessage,
    },
  });
}
