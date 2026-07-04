import { prisma } from "@/lib/db";

const FREE_MONTHLY_LIMIT = 20;
const MS_IN_30_DAYS = 30 * 24 * 60 * 60 * 1000;

export class CreditLimitError extends Error {
  constructor() {
    super("You've used all your AI credits for this cycle. They reset automatically every 30 days.");
    this.name = "CreditLimitError";
  }
}

async function getOrCreateCredit(userId: string) {
  let credit = await prisma.aICredit.findUnique({ where: { userId } });

  if (!credit) {
    credit = await prisma.aICredit.create({
      data: { userId, monthlyLimit: FREE_MONTHLY_LIMIT },
    });
    return credit;
  }

  const cycleExpired = Date.now() - credit.cycleStart.getTime() > MS_IN_30_DAYS;
  if (cycleExpired) {
    credit = await prisma.aICredit.update({
      where: { userId },
      data: { used: 0, cycleStart: new Date() },
    });
  }

  return credit;
}

export async function getCreditStatus(userId: string) {
  const credit = await getOrCreateCredit(userId);
  return {
    used: credit.used,
    limit: credit.monthlyLimit,
    remaining: Math.max(0, credit.monthlyLimit - credit.used),
    plan: credit.plan,
    cycleStart: credit.cycleStart,
  };
}

/**
 * Atomically checks and consumes one AI credit for the user. Throws
 * CreditLimitError if the user has exhausted their monthly allowance.
 */
export async function consumeCredit(userId: string, amount = 1): Promise<void> {
  const credit = await getOrCreateCredit(userId);

  if (credit.used + amount > credit.monthlyLimit) {
    throw new CreditLimitError();
  }

  const updated = await prisma.aICredit.updateMany({
    where: { userId, used: { lte: credit.monthlyLimit - amount } },
    data: { used: { increment: amount } },
  });

  if (updated.count === 0) {
    throw new CreditLimitError();
  }
}
