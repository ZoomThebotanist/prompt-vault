import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherAccounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    platform: string;
    accountHandle: string;
    accessToken: string;
    refreshToken?: string | null;
  };

  const { platform, accountHandle, accessToken, refreshToken } = body;

  if (!platform || !accountHandle?.trim() || !accessToken?.trim()) {
    return NextResponse.json({ error: "platform, accountHandle, and accessToken are required" }, { status: 400 });
  }

  const handle = accountHandle.trim().replace(/^@/, "");

  // Upsert (support reconnect with new token)
  const [existing] = await db
    .select({ id: publisherAccounts.id })
    .from(publisherAccounts)
    .where(
      and(
        eq(publisherAccounts.userId, session.user.id),
        eq(publisherAccounts.platform, platform),
        eq(publisherAccounts.accountHandle, handle)
      )
    );

  if (existing) {
    await db
      .update(publisherAccounts)
      .set({
        accessToken: accessToken.trim(),
        refreshToken: refreshToken ?? null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(publisherAccounts.id, existing.id));
    return NextResponse.json({ success: true, updated: true });
  }

  const [account] = await db.insert(publisherAccounts).values({
    userId: session.user.id,
    platform,
    accountHandle: handle,
    accountName: handle,
    accessToken: accessToken.trim(),
    refreshToken: refreshToken ?? null,
    isActive: true,
  }).returning();

  return NextResponse.json({ data: account }, { status: 201 });
}
