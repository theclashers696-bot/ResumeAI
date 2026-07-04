import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { streamText } from "@/lib/ai/gemini";
import { CHAT_SYSTEM_INSTRUCTION } from "@/lib/ai/prompts";
import { consumeCredit, CreditLimitError } from "@/lib/ai/credits";
import { requireSession, unauthorized } from "@/lib/ai/route-helpers";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/types";

const bodySchema = z.object({
  sessionId: z.string().min(1),
  message: z.string().min(1).max(4000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(20)
    .optional()
    .default([]),
});

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json<ApiResponse>({ error: "sessionId is required" }, { status: 400 });

  const messages = await prisma.aIChatMessage.findMany({
    where: { userId: session.user.id, sessionId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json<ApiResponse>({ data: messages });
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return unauthorized();

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json<ApiResponse>({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  try {
    await consumeCredit(session.user.id);
  } catch (err) {
    if (err instanceof CreditLimitError) {
      return NextResponse.json<ApiResponse>({ error: err.message }, { status: 429 });
    }
    throw err;
  }

  const { sessionId, message, history } = parsed.data;

  await prisma.aIChatMessage.create({
    data: { userId: session.user.id, sessionId, role: "user", content: message },
  });

  const conversation = history.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
  const prompt = `${conversation ? `${conversation}\n` : ""}User: ${message}\nAssistant:`;

  const encoder = new TextEncoder();
  let fullReply = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamText(prompt, { systemInstruction: CHAT_SYSTEM_INSTRUCTION, maxOutputTokens: 1024 })) {
          fullReply += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        controller.enqueue(encoder.encode(`\n\n[error] ${message}`));
      } finally {
        controller.close();
        if (fullReply) {
          await prisma.aIChatMessage.create({
            data: { userId: session.user.id, sessionId, role: "assistant", content: fullReply },
          });
        }
      }
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
