import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { prompts, purchases, creatorProfiles } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { resend } from "@/lib/resend";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Sign in to claim free prompts" }, { status: 401 });

  const { id } = await params;
  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id)).limit(1);

  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (prompt.status !== "published") return NextResponse.json({ error: "Not available" }, { status: 400 });
  if (prompt.priceCents !== 0) return NextResponse.json({ error: "This prompt is not free" }, { status: 400 });

  // Idempotency — don't create a duplicate claim
  const [existing] = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(and(eq(purchases.promptId, prompt.id), eq(purchases.buyerId, session.user.id)))
    .limit(1);

  if (existing) return NextResponse.json({ success: true, alreadyClaimed: true });

  await db.insert(purchases).values({
    promptId: prompt.id,
    creatorId: prompt.creatorId,
    buyerId: session.user.id,
    customerEmail: session.user.email,
    amountCents: 0,
    platformFeeCents: 0,
    creatorEarningsCents: 0,
    deliveredAt: new Date(),
  });

  // Update stats
  await db.update(prompts).set({ salesCount: sql`sales_count + 1` }).where(eq(prompts.id, prompt.id));
  await db.update(creatorProfiles).set({ totalSales: sql`total_sales + 1` }).where(eq(creatorProfiles.userId, prompt.creatorId));

  // Email the prompt content
  try {
    const escaped = prompt.fullContent.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://promptvault.dev";
    await resend.emails.send({
      from: "PromptVault <delivery@promptvault.dev>",
      to: session.user.email,
      subject: `Your free prompt: ${prompt.title}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#e4e4e7;margin:0;padding:20px}.c{max-width:640px;margin:0 auto}h1{font-size:24px;font-weight:700;color:#fff;margin-bottom:4px}.sub{color:#71717a;font-size:14px;margin-bottom:32px}.box{background:#18181b;border:1px solid #27272a;border-radius:8px;padding:24px}.lbl{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#52525b;margin-bottom:12px}pre{color:#d4d4d8;font-family:monospace;font-size:13px;line-height:1.7;white-space:pre-wrap;word-wrap:break-word;margin:0}.ft{margin-top:32px;color:#52525b;font-size:12px;text-align:center}</style></head><body><div class="c"><h1>Your free prompt.</h1><p class="sub">${prompt.title}</p><div class="box"><div class="lbl">Your Prompt</div><pre>${escaped}</pre></div><div class="ft"><a href="${baseUrl}/p/${prompt.slug}" style="color:#7c3aed">View prompt page</a> &mdash; PromptVault</div></div></body></html>`,
      text: `Your free prompt is ready!\n\n${prompt.title}\n\n${"─".repeat(40)}\n\n${prompt.fullContent}\n\n${"─".repeat(40)}\n\n— PromptVault`,
    });
  } catch {
    // Email failure is non-critical — purchase is already recorded, user can download from /purchases
  }

  return NextResponse.json({ success: true });
}
