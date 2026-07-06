import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherCampaigns } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaigns = await db.select().from(publisherCampaigns).where(eq(publisherCampaigns.userId, session.user.id));
  return NextResponse.json({ data: campaigns });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description, startDate, endDate } = await req.json() as {
    name: string; description?: string; startDate?: string; endDate?: string;
  };

  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const [campaign] = await db.insert(publisherCampaigns).values({
    userId: session.user.id,
    name: name.trim(),
    description: description ?? null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
  }).returning();

  return NextResponse.json({ data: campaign }, { status: 201 });
}
