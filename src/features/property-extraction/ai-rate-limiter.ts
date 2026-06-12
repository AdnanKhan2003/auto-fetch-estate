import { db } from "@/db";
import { apiQuota } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const REQUEST_PER_DAY = 20;

async function checkQuotaAndConsume() {
  const currentPacificDate = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "short",
  });

  let quotaRecord = await db.query.apiQuota.findFirst({
    where: eq(apiQuota.id, "global"),
  });

  if (!quotaRecord) {
    const [newRecord] = await db
      .insert(apiQuota)
      .values({
        id: "global",
        requestsToday: 0,
        tokensUsedToday: 0,
        lastResetDate: currentPacificDate,
      })
      .returning();

    quotaRecord = newRecord;
  }

  let { requestsToday, tokensUsedToday, lastResetDate } = quotaRecord;

  if (lastResetDate !== currentPacificDate) {
    requestsToday = 0;
    tokensUsedToday = 0;
    lastResetDate = currentPacificDate;
  }

  if (requestsToday >= REQUEST_PER_DAY) {
    throw new Error(
      `Google AI Daily Limit (${REQUEST_PER_DAY} RPD) reached. Try tomorrow.`,
    );
  }

  const dayChanged = lastResetDate !== currentPacificDate;

  await db
    .update(apiQuota)
    .set({
      requestsToday: dayChanged ? 1 : sql`${apiQuota.requestsToday} + 1`,
      tokensUsedToday: dayChanged ? 0 : tokensUsedToday,
      lastResetDate: currentPacificDate,
      updatedAt: new Date(),
    })
    .where(eq(apiQuota.id, "global"));
}

async function logTokensUsed(tokens: number) {
  const quotaRecord = await db.query.apiQuota.findFirst({
    where: eq(apiQuota.id, "global"),
  });

  if (quotaRecord) {
    await db
      .update(apiQuota)
      .set({
        tokensUsedToday: quotaRecord.tokensUsedToday + tokens,
      })
      .where(eq(apiQuota.id, "global"));
  }
}

async function getQuotaMetrics() {
  const quotaRecord = await db.query.apiQuota.findFirst({
    where: eq(apiQuota.id, "global"),
  });

  const used = quotaRecord?.requestsToday || 0;

  return {
    rpdRemaining: Math.max(REQUEST_PER_DAY - used, 0),
  };
}

export {
  checkQuotaAndConsume,
  logTokensUsed,
  getQuotaMetrics,
  REQUEST_PER_DAY,
};
