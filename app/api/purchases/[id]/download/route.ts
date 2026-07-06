import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { purchases, prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [purchase] = await db
    .select({
      buyerId: purchases.buyerId,
      promptId: purchases.promptId,
      refundedAt: purchases.refundedAt,
      promptTitle: prompts.title,
      promptFullContent: prompts.fullContent,
    })
    .from(purchases)
    .leftJoin(prompts, eq(purchases.promptId, prompts.id))
    .where(eq(purchases.id, id))
    .limit(1);

  if (!purchase) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (purchase.buyerId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (purchase.refundedAt) {
    return NextResponse.json({ error: "This purchase was refunded" }, { status: 403 });
  }
  if (!purchase.promptFullContent) {
    return NextResponse.json({ error: "Content not available" }, { status: 404 });
  }

  const filename = (purchase.promptTitle ?? "prompt").toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".txt";

  return new NextResponse(purchase.promptFullContent, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
