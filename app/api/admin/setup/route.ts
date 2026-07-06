import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";

// One-time bootstrap: promotes the calling user to admin.
// Only works when there are zero admins in the database.
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(user)
    .where(eq(user.role, "admin"));

  if (count > 0) {
    return NextResponse.json({ error: "An admin already exists. Use the database to change roles." }, { status: 403 });
  }

  await db.update(user).set({ role: "admin", updatedAt: new Date() }).where(eq(user.id, session.user.id));

  return NextResponse.json({ success: true, message: `${session.user.email} is now an admin. Reload the page.` });
}
