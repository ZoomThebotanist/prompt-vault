import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { prompts, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { promptId, action, reason } = await req.json();

  if (action === "approve") {
    const [prompt] = await db.update(prompts)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(prompts.id, promptId))
      .returning({ creatorId: prompts.creatorId, title: prompts.title, slug: prompts.slug });

    if (prompt) {
      await db.insert(notifications).values({
        userId: prompt.creatorId,
        type: "featured",
        title: "Your prompt is live! 🎉",
        body: `"${prompt.title}" has been approved and is now on the marketplace.`,
        actionUrl: `/p/${prompt.slug}`,
      }).catch(() => {});
    }
    return NextResponse.json({ success: true });
  }

  if (action === "reject") {
    const [prompt] = await db.update(prompts)
      .set({ status: "rejected", rejectionReason: reason ?? "Does not meet marketplace guidelines.", updatedAt: new Date() })
      .where(eq(prompts.id, promptId))
      .returning({ creatorId: prompts.creatorId, title: prompts.title });

    if (prompt) {
      await db.insert(notifications).values({
        userId: prompt.creatorId,
        type: "featured",
        title: "Prompt review update",
        body: `"${prompt.title}" was not approved. Reason: ${reason ?? "Does not meet guidelines."}`,
        actionUrl: "/dashboard/prompts",
      }).catch(() => {});
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
