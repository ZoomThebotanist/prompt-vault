import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { db } from "@/db";
import { products, purchases, prompts, creatorProfiles, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type Stripe from "stripe";

export const runtime = "nodejs";

const PLATFORM_FEE_PERCENT = 20;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const meta = session.metadata ?? {};
  const customerEmail = session.customer_details?.email;
  if (!customerEmail) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  // Idempotency
  const existing = await db.select().from(purchases).where(eq(purchases.stripeSessionId, session.id)).limit(1);
  if (existing.length > 0) return NextResponse.json({ received: true });

  const amountCents = session.amount_total ?? 0;
  const platformFeeCents = Math.round(amountCents * PLATFORM_FEE_PERCENT / 100);
  const creatorEarningsCents = amountCents - platformFeeCents;

  // ── Handle new prompt purchase ──
  if (meta.promptId) {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, meta.promptId)).limit(1);
    if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });

    await db.insert(purchases).values({
      promptId: prompt.id,
      creatorId: prompt.creatorId,
      buyerId: meta.buyerId ?? null,
      customerEmail,
      stripePaymentIntentId: session.payment_intent as string,
      stripeSessionId: session.id,
      amountCents,
      platformFeeCents,
      creatorEarningsCents,
      deliveredAt: new Date(),
    });

    // Update prompt stats
    await db.update(prompts).set({ salesCount: sql`sales_count + 1` }).where(eq(prompts.id, prompt.id));

    // Update creator earnings
    await db.update(creatorProfiles).set({
      totalSales: sql`total_sales + 1`,
      totalRevenueCents: sql`total_revenue_cents + ${creatorEarningsCents}`,
      pendingPayoutCents: sql`pending_payout_cents + ${creatorEarningsCents}`,
    }).where(eq(creatorProfiles.userId, prompt.creatorId));

    // Notify creator
    await db.insert(notifications).values({
      userId: prompt.creatorId,
      type: "purchase",
      title: "New sale! 🎉",
      body: `Someone purchased "${prompt.title}" — you earned $${(creatorEarningsCents / 100).toFixed(2)}`,
      actionUrl: "/dashboard",
    }).catch(() => {}); // non-critical

    // Deliver prompt to buyer via email
    await resend.emails.send({
      from: "PromptVault <delivery@promptvault.dev>",
      to: customerEmail,
      subject: `Your purchase: ${prompt.title}`,
      text: buildEmailText(prompt.title, prompt.fullContent),
      html: buildEmailHtml(prompt.title, prompt.fullContent, prompt.slug),
    });
  }
  // ── Handle legacy product purchase ──
  else if (meta.productId) {
    const [product] = await db.select().from(products).where(eq(products.id, meta.productId)).limit(1);
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await db.insert(purchases).values({
      productId: product.id,
      customerEmail,
      stripePaymentIntentId: session.payment_intent as string,
      stripeSessionId: session.id,
      amountCents: product.priceCents,
      deliveredAt: new Date(),
    });

    await resend.emails.send({
      from: "PromptVault <delivery@promptvault.dev>",
      to: customerEmail,
      subject: `Your purchase: ${product.title}`,
      text: buildEmailText(product.title, product.fileContent),
      html: buildEmailHtml(product.title, product.fileContent, product.slug),
    });
  }

  return NextResponse.json({ received: true });
}

function buildEmailText(title: string, content: string): string {
  return `Your PromptVault purchase is ready!\n\nProduct: ${title}\n\n${"─".repeat(40)}\n\n${content}\n\n${"─".repeat(40)}\n\nHow to use:\n• Copy the prompt and paste it into Claude, ChatGPT, or your AI tool.\n• Replace [PLACEHOLDER] variables with your specific details.\n• Questions? Reply to this email.\n\n— PromptVault`;
}

function buildEmailHtml(title: string, content: string, slug: string): string {
  const escaped = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://promptvault.dev";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:-apple-system,sans-serif;background:#0a0a0a;color:#e4e4e7;margin:0;padding:20px}.c{max-width:640px;margin:0 auto}h1{font-size:24px;font-weight:700;color:#fff;margin-bottom:4px}.sub{color:#71717a;font-size:14px;margin-bottom:32px}.box{background:#18181b;border:1px solid #27272a;border-radius:8px;padding:24px}.lbl{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#52525b;margin-bottom:12px}pre{color:#d4d4d8;font-family:monospace;font-size:13px;line-height:1.7;white-space:pre-wrap;word-wrap:break-word;margin:0}.tip{margin-top:32px;padding:16px;background:#18181b;border-radius:8px;border-left:3px solid #22c55e}.tip h3{color:#22c55e;font-size:13px;margin:0 0 8px}.tip p{color:#a1a1aa;font-size:13px;margin:4px 0}.ft{margin-top:32px;color:#52525b;font-size:12px;text-align:center}</style></head><body><div class="c"><h1>Your prompt is ready.</h1><p class="sub">${title}</p><div class="box"><div class="lbl">Your Prompt</div><pre>${escaped}</pre></div><div class="tip"><h3>How to use</h3><p>Paste into Claude, ChatGPT, or your AI of choice.</p><p>Replace any [PLACEHOLDER] text with your details.</p><p>Questions? Reply to this email.</p></div><div class="ft"><a href="${baseUrl}/p/${slug}" style="color:#7c3aed">View prompt page</a> &mdash; PromptVault</div></div></body></html>`;
}
