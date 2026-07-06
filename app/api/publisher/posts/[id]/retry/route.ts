import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherPosts, publisherPostPlatforms } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [post] = await db.select().from(publisherPosts).where(
    and(eq(publisherPosts.id, id), eq(publisherPosts.userId, session.user.id))
  );
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.update(publisherPosts).set({ status: "queued", updatedAt: new Date() }).where(eq(publisherPosts.id, id));
  await db.update(publisherPostPlatforms)
    .set({ status: "pending", attempts: 0, nextRetryAt: null, errorMessage: null, updatedAt: new Date() })
    .where(and(eq(publisherPostPlatforms.postId, id), eq(publisherPostPlatforms.status, "failed")));

  fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/publish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET ?? "dev"}` },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
