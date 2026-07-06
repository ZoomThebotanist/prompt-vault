"use server";

import { db } from "@/db";
import { publisherAccounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateRedditSubreddit(accountId: string, subreddit: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Not authenticated");

  // Clean the subreddit value — strip r/ prefix and whitespace
  const cleaned = subreddit.replace(/^r\//, "").trim().slice(0, 100);

  const [account] = await db
    .select({ id: publisherAccounts.id, metadata: publisherAccounts.metadata })
    .from(publisherAccounts)
    .where(and(eq(publisherAccounts.id, accountId), eq(publisherAccounts.userId, session.user.id)));

  if (!account) throw new Error("Account not found");

  const existing = account.metadata ? (JSON.parse(account.metadata) as Record<string, unknown>) : {};
  const updated = { ...existing, subreddit: cleaned };

  await db
    .update(publisherAccounts)
    .set({ metadata: JSON.stringify(updated) })
    .where(eq(publisherAccounts.id, accountId));

  revalidatePath("/publisher/accounts");
}
