import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id)).limit(1);
  if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(prompt);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db
    .select({ id: prompts.id, creatorId: prompts.creatorId, slug: prompts.slug })
    .from(prompts)
    .where(eq(prompts.id, id))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (existing.creatorId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, subtitle, description, longDescription, category,
    fullContent, previewContent, difficulty, modelSupport,
    pricingType, priceCents, minPriceCents, slug,
    seoTitle, seoDescription, coverImageUrl, demoOutput, useCases,
  } = body;

  // If slug changed, check it's not taken by another prompt
  if (slug && slug !== existing.slug) {
    const [conflict] = await db
      .select({ id: prompts.id })
      .from(prompts)
      .where(and(eq(prompts.slug, slug)))
      .limit(1);
    if (conflict && conflict.id !== id) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
    }
  }

  const [updated] = await db
    .update(prompts)
    .set({
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(description !== undefined && { description }),
      ...(longDescription !== undefined && { longDescription }),
      ...(category !== undefined && { category }),
      ...(fullContent !== undefined && { fullContent }),
      ...(previewContent !== undefined && { previewContent }),
      ...(difficulty !== undefined && { difficulty }),
      ...(modelSupport !== undefined && { modelSupport }),
      ...(pricingType !== undefined && { pricingType }),
      ...(priceCents !== undefined && { priceCents }),
      ...(minPriceCents !== undefined && { minPriceCents }),
      ...(slug !== undefined && { slug }),
      ...(seoTitle !== undefined && { seoTitle }),
      ...(seoDescription !== undefined && { seoDescription }),
      ...(coverImageUrl !== undefined && { coverImageUrl }),
      ...(demoOutput !== undefined && { demoOutputUrl: demoOutput }),
      ...(useCases !== undefined && { useCases }),
      // Editing resets to pending for re-review (unless admin)
      ...(session.user.role !== "admin" && { status: "pending" }),
      updatedAt: new Date(),
    })
    .where(eq(prompts.id, id))
    .returning({ id: prompts.id, slug: prompts.slug });

  return NextResponse.json({ id: updated.id, slug: updated.slug });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [existing] = await db
    .select({ creatorId: prompts.creatorId })
    .from(prompts)
    .where(eq(prompts.id, id))
    .limit(1);

  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.creatorId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(prompts).where(eq(prompts.id, id));
  return NextResponse.json({ success: true });
}
