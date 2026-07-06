import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, creatorProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { displayName, username, headline, bio, website, twitter, payoutEmail } = await req.json();

  if (!displayName?.trim()) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  // Check if already a creator
  const existing = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, session.user.id)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Already a creator" }, { status: 409 });
  }

  // Create creator profile
  await db.insert(creatorProfiles).values({
    userId: session.user.id,
    displayName: displayName.trim(),
    headline: headline?.trim() || null,
    bio: bio?.trim() || null,
    website: website?.trim() || null,
    twitterHandle: twitter?.trim().replace("@", "") || null,
    payoutEmail: payoutEmail?.trim() || session.user.email,
    onboardedAt: new Date(),
  });

  // Upgrade user role to creator and set username if provided
  await db.update(user).set({
    role: "creator",
    updatedAt: new Date(),
    ...(username?.trim() && { username: username.trim().toLowerCase() }),
  }).where(eq(user.id, session.user.id));

  return NextResponse.json({ success: true });
}
