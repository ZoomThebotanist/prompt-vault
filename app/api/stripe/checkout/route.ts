import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProductBySlug } from "@/lib/products";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { productId, productSlug } = await req.json();

  const rows = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  const product = rows[0];

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: product.priceCents,
          product_data: {
            name: product.title,
            description: product.description,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      productId: product.id,
      productSlug: product.slug,
    },
    customer_email: undefined,
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/products/${product.slug}`,
  });

  return NextResponse.json({ url: session.url });
}
