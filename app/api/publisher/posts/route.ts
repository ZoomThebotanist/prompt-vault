import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherPosts, publisherPostPlatforms } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createHash } from "crypto";
import type { PlatformSlug } from "@/lib/publisher/types";

function contentHash(title: string, description: string, link: string): string {
  return createHash("sha256").update(`${title}||${description}||${link}`).digest("hex");
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const posts = await db
    .select()
    .from(publisherPosts)
    .where(eq(publisherPosts.userId, session.user.id))
    .orderBy(desc(publisherPosts.createdAt));

  return NextResponse.json({ data: posts });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    title?: string;
    description?: string;
    link?: string;
    hashtags?: string[];
    mediaUrls?: string[];
    accountIds?: string[];
    platformOverrides?: Partial<Record<PlatformSlug, { text?: string }>>;
    scheduleMode?: "now" | "schedule" | "draft";
    scheduledAt?: string | null;
    timezone?: string;
    campaignId?: string | null;
    priority?: number;
  };

  const {
    title = "", description = "", link = "", hashtags = [], mediaUrls = [],
    accountIds = [], platformOverrides = {}, scheduleMode = "draft",
    scheduledAt, timezone = "UTC", campaignId, priority = 5,
  } = body;

  const hash = contentHash(title, description, link);

  const status = scheduleMode === "draft" ? "draft" : scheduleMode === "now" ? "queued" : "waiting";

  const [post] = await db.insert(publisherPosts).values({
    userId: session.user.id,
    campaignId: campaignId ?? null,
    title: title || null,
    description: description || null,
    hashtags,
    link: link || null,
    mediaUrls,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    timezone,
    status,
    contentHash: hash,
    priority,
    source: "manual",
  }).returning();

  // Create per-platform records
  if (accountIds.length > 0) {
    const platformRecords = accountIds.map((accountId) => {
      // Find the platform for this account from the overrides key
      const override = Object.entries(platformOverrides).find(([platform]) =>
        // We'll store accountId→platform mapping via a lookup below
        false
      );
      return {
        postId: post.id,
        accountId,
        platform: "x" as string, // Will be resolved below
        customText: null as string | null,
        customHashtags: [] as string[],
      };
    });

    // Resolve platform per account
    const { publisherAccounts } = await import("@/db/schema");
    for (const accountId of accountIds) {
      const [account] = await db.select().from(publisherAccounts).where(eq(publisherAccounts.id, accountId));
      if (!account) continue;
      const platform = account.platform as PlatformSlug;
      const override = platformOverrides[platform];
      await db.insert(publisherPostPlatforms).values({
        postId: post.id,
        accountId,
        platform,
        customText: override?.text ?? null,
        customHashtags: [],
        status: status === "queued" ? "pending" : "pending",
      });
    }
  }

  // If publish now, kick off publish cycle immediately
  if (scheduleMode === "now" && accountIds.length > 0) {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/publish`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET ?? "dev"}` },
    }).catch(() => {/* fire and forget */});
  }

  return NextResponse.json({ data: post }, { status: 201 });
}
