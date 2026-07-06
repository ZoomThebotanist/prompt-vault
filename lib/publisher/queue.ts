import { db } from "@/db";
import { publisherPosts, publisherPostPlatforms, publisherAccounts, publishLogs } from "@/db/schema";
import { eq, and, lte, inArray, or, isNull, sql } from "drizzle-orm";
import { getAdapter } from "./adapters";
import type { PlatformSlug } from "./types";
import { rewriteForReddit } from "./reddit-rewrite";

const BATCH_SIZE = 10;
const MAX_ATTEMPTS = 5;

// Exponential backoff: 2min, 4min, 8min, 16min, 32min
function nextRetryDelay(attempt: number): number {
  return Math.pow(2, attempt) * 2 * 60 * 1000;
}

export async function runPublishCycle(): Promise<{ processed: number; succeeded: number; failed: number }> {
  const now = new Date();

  // Claim due platform jobs by atomically moving them to 'publishing'.
  // Vercel Cron runs single-instance per minute, so a simple status check is safe.
  // We update one at a time to ensure we only process what we claimed.
  const due = await db
    .select()
    .from(publisherPostPlatforms)
    .where(
      and(
        inArray(publisherPostPlatforms.status, ["pending", "retrying"]),
        or(isNull(publisherPostPlatforms.nextRetryAt), lte(publisherPostPlatforms.nextRetryAt, now))
      )
    )
    .limit(BATCH_SIZE);

  if (due.length === 0) return { processed: 0, succeeded: 0, failed: 0 };

  // Mark them all as 'publishing' before we start (so a second cron overlap can't double-claim)
  const dueIds = due.map((r) => r.id);
  await db
    .update(publisherPostPlatforms)
    .set({ status: "publishing", updatedAt: new Date() })
    .where(and(inArray(publisherPostPlatforms.id, dueIds), inArray(publisherPostPlatforms.status, ["pending", "retrying"])));

  // Re-fetch the rows we actually claimed (status check acts as optimistic lock)
  const claimed = await db
    .select()
    .from(publisherPostPlatforms)
    .where(and(inArray(publisherPostPlatforms.id, dueIds), eq(publisherPostPlatforms.status, "publishing")));

  let succeeded = 0;
  let failed = 0;

  for (const row of claimed) {
    const start = Date.now();
    const attemptNumber = (row.attempts ?? 0) + 1;

    try {
      const [post] = await db.select().from(publisherPosts).where(eq(publisherPosts.id, row.postId));
      const [account] = await db.select().from(publisherAccounts).where(eq(publisherAccounts.id, row.accountId));

      if (!post || !account) throw new Error("Post or account not found");
      if (!account.accessToken) throw new Error("No access token — reconnect this account");

      const adapter = getAdapter(row.platform as PlatformSlug);
      const accountMeta = account.metadata ? (JSON.parse(account.metadata) as Record<string, unknown>) : {};

      let contentText = row.customText ?? post.description ?? "";

      // For Reddit: rewrite content to be native and non-promotional using Claude AI
      if (row.platform === "reddit" && contentText) {
        const subreddit = String(accountMeta.subreddit ?? "");
        const rewritten = await rewriteForReddit(contentText, subreddit || "general");
        if (rewritten) {
          contentText = `${rewritten.title}\n${rewritten.body}`;
        }
      }

      const content = {
        text: contentText,
        hashtags: (row.customHashtags?.length ? row.customHashtags : post.hashtags) ?? [],
        link: post.link ?? undefined,
        mediaUrls: post.mediaUrls ?? [],
      };

      const validation = adapter.validate(content);
      if (!validation.valid) {
        throw new Error(`Validation: ${validation.errors.map((e) => e.message).join(", ")}`);
      }

      const payload = adapter.transform(content);

      // Inject platform-specific account metadata into payload
      if (row.platform === "reddit") {
        payload.sr = String(accountMeta.subreddit ?? "");
      }

      const result = await adapter.publish(payload, account.accessToken);
      const latency = Date.now() - start;

      await db.update(publisherPostPlatforms).set({
        status: "published",
        platformPostId: result.platformPostId,
        publishedUrl: result.publishedUrl,
        publishedAt: new Date(),
        attempts: attemptNumber,
        errorMessage: null,
        errorType: null,
        updatedAt: new Date(),
      }).where(eq(publisherPostPlatforms.id, row.id));

      await db.insert(publishLogs).values({
        postPlatformId: row.id,
        success: true,
        latencyMs: latency,
        attemptNumber,
      });

      succeeded++;
    } catch (err) {
      const latency = Date.now() - start;
      const message = err instanceof Error ? err.message : String(err);
      const isRetryable = attemptNumber < MAX_ATTEMPTS;

      await db.update(publisherPostPlatforms).set({
        status: isRetryable ? "retrying" : "failed",
        errorMessage: message,
        attempts: attemptNumber,
        nextRetryAt: isRetryable ? new Date(Date.now() + nextRetryDelay(attemptNumber)) : null,
        updatedAt: new Date(),
      }).where(eq(publisherPostPlatforms.id, row.id));

      await db.insert(publishLogs).values({
        postPlatformId: row.id,
        success: false,
        errorMessage: message,
        latencyMs: latency,
        attemptNumber,
      });

      failed++;
    }
  }

  // Reconcile parent post statuses
  const uniquePostIds = [...new Set(claimed.map((r) => r.postId))];
  for (const postId of uniquePostIds) {
    await reconcilePostStatus(postId);
  }

  return { processed: claimed.length, succeeded, failed };
}

async function reconcilePostStatus(postId: string) {
  const platforms = await db
    .select({ status: publisherPostPlatforms.status })
    .from(publisherPostPlatforms)
    .where(eq(publisherPostPlatforms.postId, postId));

  if (platforms.length === 0) return;

  const statuses = platforms.map((p) => p.status);
  const allPublished = statuses.every((s) => s === "published");
  const anyPublished = statuses.some((s) => s === "published");
  const anyActive = statuses.some((s) => ["pending", "publishing", "retrying"].includes(s));
  const allFailed = statuses.every((s) => s === "failed");

  const newStatus = allPublished
    ? "published"
    : allFailed
      ? "failed"
      : anyPublished && !anyActive
        ? "partial"
        : anyActive
          ? "publishing"
          : "failed";

  await db.update(publisherPosts).set({
    status: newStatus,
    publishedAt: allPublished ? new Date() : undefined,
    updatedAt: new Date(),
  }).where(eq(publisherPosts.id, postId));
}
