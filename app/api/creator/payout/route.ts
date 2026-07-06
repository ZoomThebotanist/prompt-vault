import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { payouts, creatorProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, session.user.id)).limit(1);
  if (!profile) return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  if (profile.pendingPayoutCents < 1000) return NextResponse.json({ error: "Minimum payout is $10" }, { status: 400 });

  // Create payout record (actual transfer would happen via Stripe Connect)
  await db.insert(payouts).values({
    creatorId: session.user.id,
    amountCents: profile.pendingPayoutCents,
    status: "pending",
    notes: `Manual payout request to ${profile.payoutEmail}`,
  });

  // Clear pending balance
  await db.update(creatorProfiles).set({ pendingPayoutCents: 0 }).where(eq(creatorProfiles.userId, session.user.id));

  return NextResponse.json({ success: true });
}
