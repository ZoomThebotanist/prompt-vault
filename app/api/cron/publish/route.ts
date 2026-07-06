import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { publisherPosts, publisherPostPlatforms } from "@/db/schema";
import { and, lte, eq, inArray } from "drizzle-orm";
import { runPublishCycle } from "@/lib/publisher/queue";

// Vercel Cron calls this via GET every minute.
// POST is used for manual "publish now" triggers from the app.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handler();
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET ?? "dev";
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return handler();
}

async function handler() {
  const now = new Date();

  // Promote waiting posts whose scheduled time has arrived → queued
  const dueWaiting = await db
    .select({ id: publisherPosts.id })
    .from(publisherPosts)
    .where(and(eq(publisherPosts.status, "waiting"), lte(publisherPosts.scheduledAt, now)));

  if (dueWaiting.length > 0) {
    const ids = dueWaiting.map((p) => p.id);
    await db.update(publisherPosts).set({ status: "queued", updatedAt: new Date() })
      .where(inArray(publisherPosts.id, ids));
  }

  // Run the publish cycle (claims pending platform jobs and executes them)
  const result = await runPublishCycle();

  return NextResponse.json({ ok: true, ...result, promoted: dueWaiting.length, timestamp: now.toISOString() });
}
