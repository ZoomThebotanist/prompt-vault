import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { wishlists, prompts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { promptId } = await req.json();
  await db.insert(wishlists).values({ userId: session.user.id, promptId }).onConflictDoNothing();
  await db.update(prompts).set({ wishlistCount: sql`wishlist_count + 1` }).where(eq(prompts.id, promptId));

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { promptId } = await req.json();
  await db.delete(wishlists).where(and(eq(wishlists.userId, session.user.id), eq(wishlists.promptId, promptId)));
  await db.update(prompts).set({ wishlistCount: sql`greatest(wishlist_count - 1, 0)` }).where(eq(prompts.id, promptId));

  return NextResponse.json({ success: true });
}
