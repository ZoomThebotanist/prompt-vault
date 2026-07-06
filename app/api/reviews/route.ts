import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reviews, purchases, prompts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { promptId, rating, title, body } = await req.json();

  if (!promptId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
  }

  // Verify purchase
  const [purchase] = await db.select()
    .from(purchases)
    .where(and(eq(purchases.promptId, promptId), eq(purchases.buyerId, session.user.id)))
    .limit(1);

  if (!purchase) {
    return NextResponse.json({ error: "You must purchase this prompt to leave a review" }, { status: 403 });
  }

  // Check no duplicate review
  const existing = await db.select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.promptId, promptId), eq(reviews.reviewerId, session.user.id)))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: "You have already reviewed this prompt" }, { status: 409 });
  }

  // Insert review
  await db.insert(reviews).values({
    promptId,
    reviewerId: session.user.id,
    purchaseId: purchase.id,
    rating,
    title: title?.trim() || null,
    body: body?.trim() || null,
  });

  // Update prompt stats
  const [stats] = await db
    .select({ count: sql<number>`count(*)::int`, avg: sql<number>`avg(rating)::numeric(3,2)` })
    .from(reviews)
    .where(eq(reviews.promptId, promptId));

  await db.update(prompts).set({
    reviewCount: stats.count,
    avgRating: String(stats.avg),
    updatedAt: new Date(),
  }).where(eq(prompts.id, promptId));

  return NextResponse.json({ success: true });
}
