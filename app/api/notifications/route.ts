import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20);

  const unreadCount = rows.filter(n => !n.read).length;
  return NextResponse.json({ notifications: rows, unreadCount });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, markAllRead } = await req.json();

  if (markAllRead) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, session.user.id), eq(notifications.read, false)));
  } else if (id) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, session.user.id)));
  }

  return NextResponse.json({ success: true });
}
