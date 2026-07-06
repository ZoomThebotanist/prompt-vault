import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, creatorProfiles } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { headers } from "next/headers";

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, username, bio } = await req.json();

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  // Check username uniqueness if provided
  if (username?.trim()) {
    const slug = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const [conflict] = await db
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.username, slug), ne(user.id, session.user.id)))
      .limit(1);
    if (conflict) return NextResponse.json({ error: "Username already taken" }, { status: 409 });

    await db.update(user).set({
      name: name.trim(),
      username: slug,
      bio: bio?.trim() || null,
      updatedAt: new Date(),
    }).where(eq(user.id, session.user.id));
  } else {
    await db.update(user).set({
      name: name.trim(),
      bio: bio?.trim() || null,
      updatedAt: new Date(),
    }).where(eq(user.id, session.user.id));
  }

  // Sync displayName to creator profile if they have one
  if (username?.trim() || name?.trim()) {
    await db.update(creatorProfiles)
      .set({ displayName: name.trim() })
      .where(eq(creatorProfiles.userId, session.user.id));
  }

  return NextResponse.json({ success: true });
}
