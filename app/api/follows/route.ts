import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { follows, creatorProfiles } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId } = await req.json();
  if (session.user.id === creatorId) return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });

  await db.insert(follows).values({ followerId: session.user.id, creatorId }).onConflictDoNothing();
  await db.update(creatorProfiles).set({ followerCount: sql`follower_count + 1` }).where(eq(creatorProfiles.userId, creatorId));

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatorId } = await req.json();
  await db.delete(follows).where(and(eq(follows.followerId, session.user.id), eq(follows.creatorId, creatorId)));
  await db.update(creatorProfiles).set({ followerCount: sql`greatest(follower_count - 1, 0)` }).where(eq(creatorProfiles.userId, creatorId));

  return NextResponse.json({ success: true });
}
