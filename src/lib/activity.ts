import { prisma } from "./db";
import { Prisma } from "@prisma/client";
import type { ActivityAction } from "@prisma/client";

export async function logActivity(
  userId: string,
  action: ActivityAction,
  resumeId?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma.resumeActivity.create({
      data: {
        userId,
        action,
        resumeId: resumeId ?? null,
        metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  } catch {
    // Non-fatal — activity logging should never block the main operation
  }
}
