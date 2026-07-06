import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { products, prompts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const { productId, productSlug, isPrompt, customAmountCents } = await req.json();
  const session = await auth.api.getSession({ headers: await headers() });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.headers.get("origin") ?? "http://localhost:3000";

  let title: string;
  let description: string;
  let priceCents: number;
  let metadata: Record<string, string>;
  let cancelPath: string;

  if (isPrompt) {
    const rows = await db.select().from(prompts).where(eq(prompts.id, productId)).limit(1);
    const prompt = rows[0];
    if (!prompt) return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
    if (prompt.pricingType === "free") return NextResponse.json({ error: "This prompt is free — use the claim endpoint" }, { status: 400 });

    title = prompt.title;
    description = prompt.description;
    // PWYW: use caller-supplied amount (validated client-side), clamped to minimum
    if (prompt.pricingType === "pwyw" && customAmountCents != null) {
      const min = prompt.minPriceCents ?? 0;
      priceCents = Math.max(customAmountCents, min);
    } else {
      priceCents = prompt.priceCents;
    }
    cancelPath = `/p/${prompt.slug}`;
    metadata = {
      promptId: prompt.id,
      promptSlug: prompt.slug,
      creatorId: prompt.creatorId,
      ...(session?.user?.id && { buyerId: session.user.id }),
    };
  } else {
    const rows = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    const product = rows[0];
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    title = product.title;
    description = product.description;
    priceCents = product.priceCents;
    cancelPath = `/products/${product.slug}`;
    metadata = { productId: product.id, productSlug: product.slug };
  }

  const stripeSession = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price_data: { currency: "usd", unit_amount: priceCents, product_data: { name: title, description } }, quantity: 1 }],
    metadata,
    customer_email: session?.user?.email ?? undefined,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}${cancelPath}`,
  });

  return NextResponse.json({ url: stripeSession.url });
}
