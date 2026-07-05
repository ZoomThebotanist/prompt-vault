import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { resend } from "@/lib/resend";
import { db } from "@/db";
import { products, purchases } from "@/db/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const productId = session.metadata?.productId;
  const customerEmail = session.customer_details?.email;

  if (!productId || !customerEmail) {
    return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
  }

  // Idempotency: skip if already processed
  const existing = await db
    .select()
    .from(purchases)
    .where(eq(purchases.stripeSessionId, session.id))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ received: true });
  }

  // Fetch product
  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  const product = rows[0];
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Record purchase
  await db.insert(purchases).values({
    productId: product.id,
    customerEmail,
    stripePaymentIntentId: session.payment_intent as string,
    stripeSessionId: session.id,
    deliveredAt: new Date(),
  });

  // Send delivery email
  await resend.emails.send({
    from: "PromptVault <delivery@promptvault.dev>",
    to: customerEmail,
    subject: `Your purchase: ${product.title}`,
    text: buildEmailText(product.title, product.fileContent),
    html: buildEmailHtml(product.title, product.fileContent),
  });

  return NextResponse.json({ received: true });
}

function buildEmailText(title: string, content: string): string {
  return `
Your PromptVault purchase is ready!

Product: ${title}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${content}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO USE
Copy the prompt above and paste it into your AI tool of choice.
Replace any [PLACEHOLDER] variables with your specific details.
Run it and iterate — the framework handles the heavy lifting.

Questions? Reply to this email.

— PromptVault
`;
}

function buildEmailHtml(title: string, content: string): string {
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; background: #0a0a0a; color: #e4e4e7; margin: 0; padding: 20px; }
    .container { max-width: 640px; margin: 0 auto; }
    h1 { font-size: 24px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .subtitle { color: #71717a; font-size: 14px; margin-bottom: 32px; }
    .prompt-box { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 24px; }
    .prompt-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #52525b; margin-bottom: 12px; }
    pre { color: #d4d4d8; font-family: 'Fira Mono', 'Consolas', monospace; font-size: 13px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; margin: 0; }
    .instructions { margin-top: 32px; padding: 16px; background: #18181b; border-radius: 8px; border-left: 3px solid #22c55e; }
    .instructions h3 { color: #22c55e; font-size: 13px; margin: 0 0 8px 0; }
    .instructions p { color: #a1a1aa; font-size: 13px; margin: 4px 0; }
    .footer { margin-top: 32px; color: #52525b; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your prompt is ready.</h1>
    <p class="subtitle">${title}</p>

    <div class="prompt-box">
      <div class="prompt-label">Your Prompt</div>
      <pre>${escaped}</pre>
    </div>

    <div class="instructions">
      <h3>How to use</h3>
      <p>Copy the prompt above and paste it into Claude, ChatGPT, or your AI tool of choice.</p>
      <p>Replace any [PLACEHOLDER] text with your specific details.</p>
      <p>Questions? Reply to this email — we respond within 24 hours.</p>
    </div>

    <div class="footer">PromptVault — Professional AI Prompt Systems</div>
  </div>
</body>
</html>
`;
}
