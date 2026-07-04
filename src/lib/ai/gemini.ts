import { GoogleGenAI } from "@google/genai";
import pRetry from "p-retry";
import pLimit from "p-limit";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[gemini] GEMINI_API_KEY is not set — AI features will fail until it is configured.");
}

const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const DEFAULT_MODEL = "gemini-2.5-flash";

// Global concurrency limiter so we never hammer the Gemini API from a single
// Next.js server instance, regardless of how many requests come in at once.
const limit = pLimit(4);

export class AIServiceError extends Error {
  code: "NO_API_KEY" | "RATE_LIMITED" | "GENERATION_FAILED" | "INVALID_RESPONSE";

  constructor(message: string, code: AIServiceError["code"]) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
  }
}

interface GenerateOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  systemInstruction?: string;
  json?: boolean;
  /**
   * Thinking token budget for gemini-2.5 models. Defaults to 0 (disabled)
   * because "thinking" tokens are drawn from the same maxOutputTokens
   * budget — for short/structured responses this can silently consume the
   * entire budget and leave nothing for the actual answer, producing an
   * empty or truncated response. Raise this only for prompts that need
   * multi-step reasoning and have a generous maxOutputTokens to match.
   */
  thinkingBudget?: number;
}

function ensureClient(): GoogleGenAI {
  if (!client) {
    throw new AIServiceError(
      "The AI service is not configured. Ask the workspace owner to set GEMINI_API_KEY.",
      "NO_API_KEY",
    );
  }
  return client;
}

/**
 * Low level call to Gemini with retry (exponential backoff) and a shared
 * concurrency limiter. Returns raw text output.
 */
export async function generateText(prompt: string, options: GenerateOptions = {}): Promise<string> {
  const genai = ensureClient();
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxOutputTokens = 2048,
    systemInstruction,
    json,
    thinkingBudget = 0,
  } = options;

  const run = () =>
    limit(async () => {
      const response = await genai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature,
          maxOutputTokens,
          thinkingConfig: { thinkingBudget },
          ...(systemInstruction ? { systemInstruction } : {}),
          ...(json ? { responseMimeType: "application/json" } : {}),
        },
      });

      const text = response.text;
      if (!text) {
        throw new AIServiceError("Gemini returned an empty response.", "INVALID_RESPONSE");
      }
      return text;
    });

  try {
    return await pRetry(run, {
      retries: 3,
      minTimeout: 500,
      factor: 2,
      onFailedAttempt: (ctx) => {
        const msg = (ctx as { attemptNumber: number; message?: string });
        console.warn(`[gemini] attempt ${msg.attemptNumber} failed: ${msg.message ?? "unknown error"}`);
      },
    });
  } catch (err) {
    if (err instanceof AIServiceError) throw err;
    const message = err instanceof Error ? err.message : "Unknown error calling Gemini";
    throw new AIServiceError(message, "GENERATION_FAILED");
  }
}

/**
 * Calls Gemini and parses the result as JSON, stripping markdown code fences
 * if the model wraps its answer despite the JSON response mode request.
 */
export async function generateJSON<T>(prompt: string, options: GenerateOptions = {}): Promise<T> {
  const raw = await generateText(prompt, { ...options, json: true });
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AIServiceError("Failed to parse AI response as JSON.", "INVALID_RESPONSE");
  }
}

/**
 * Streams text chunks from Gemini for real-time UI updates (used by the AI
 * chat assistant). Consumers should iterate with `for await`.
 */
export async function* streamText(
  prompt: string,
  options: GenerateOptions = {},
): AsyncGenerator<string, void, unknown> {
  const genai = ensureClient();
  const {
    model = DEFAULT_MODEL,
    temperature = 0.7,
    maxOutputTokens = 2048,
    systemInstruction,
    thinkingBudget = 0,
  } = options;

  const stream = await genai.models.generateContentStream({
    model,
    contents: prompt,
    config: {
      temperature,
      maxOutputTokens,
      thinkingConfig: { thinkingBudget },
      ...(systemInstruction ? { systemInstruction } : {}),
    },
  });

  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}

export function isAIConfigured(): boolean {
  return Boolean(apiKey);
}
