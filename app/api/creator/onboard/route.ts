import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, creatorApplications, creatorProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    displayName, username, headline, bio, website, portfolio,
    twitterHandle, githubHandle, linkedinHandle, discordHandle,
    specialties, experienceLevel,
    payoutEmail, paymentMethod,
    agreedToTerms,
  } = await req.json();

  if (!displayName?.trim()) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }
  if (!agreedToTerms) {
    return NextResponse.json({ error: "You must agree to the creator terms." }, { status: 400 });
  }

  // If already a creator, redirect them
  if (session.user.role === "creator") {
    return NextResponse.json({ error: "Already a creator", alreadyCreator: true }, { status: 409 });
  }

  // If already has a creator profile, redirect
  const existingProfile = await db.select({ id: creatorProfiles.id }).from(creatorProfiles)
    .where(eq(creatorProfiles.userId, session.user.id)).limit(1);
  if (existingProfile.length > 0) {
    return NextResponse.json({ error: "Already a creator", alreadyCreator: true }, { status: 409 });
  }

  // Check for existing pending/approved application
  const existing = await db.select({ id: creatorApplications.id, status: creatorApplications.status })
    .from(creatorApplications)
    .where(eq(creatorApplications.userId, session.user.id))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].status === "pending") {
      return NextResponse.json({ error: "Application already submitted", applicationPending: true }, { status: 409 });
    }
    if (existing[0].status === "approved") {
      return NextResponse.json({ error: "Already a creator", alreadyCreator: true }, { status: 409 });
    }
    // If rejected, allow reapplication — delete old one
    await db.delete(creatorApplications).where(eq(creatorApplications.userId, session.user.id));
  }

  // Create application
  await db.insert(creatorApplications).values({
    userId: session.user.id,
    displayName: displayName.trim(),
    username: username?.trim().toLowerCase() || null,
    headline: headline?.trim() || null,
    bio: bio?.trim() || null,
    website: website?.trim() || null,
    portfolio: portfolio?.trim() || null,
    twitterHandle: twitterHandle?.trim().replace(/^@/, "") || null,
    githubHandle: githubHandle?.trim().replace(/^@/, "") || null,
    linkedinHandle: linkedinHandle?.trim() || null,
    discordHandle: discordHandle?.trim() || null,
    specialties: Array.isArray(specialties) ? specialties : [],
    experienceLevel: experienceLevel || "beginner",
    payoutEmail: (payoutEmail?.trim() || session.user.email) as string,
    paymentMethod: paymentMethod || "stripe",
    agreedToTerms: true,
  });

  // Update username on user record if provided
  if (username?.trim()) {
    await db.update(user).set({
      username: username.trim().toLowerCase(),
      updatedAt: new Date(),
    }).where(eq(user.id, session.user.id));
  }

  return NextResponse.json({ success: true, status: "pending" });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [application] = await db.select()
    .from(creatorApplications)
    .where(eq(creatorApplications.userId, session.user.id))
    .limit(1);

  return NextResponse.json({ application: application ?? null });
}
