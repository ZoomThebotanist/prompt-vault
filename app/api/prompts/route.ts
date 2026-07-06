import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { prompts, tags, promptTags } from "@/db/schema";
import { eq, and, ilike, desc, asc, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("q");
  const sort = searchParams.get("sort") ?? "newest";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "24"), 48);
  const offset = (page - 1) * limit;

  const conditions = [eq(prompts.status, "published")];
  if (category && category !== "all") conditions.push(eq(prompts.category, category));
  if (search) conditions.push(ilike(prompts.title, `%${search}%`));

  const orderBy =
    sort === "trending" ? desc(prompts.salesCount) :
    sort === "top-rated" ? desc(prompts.avgRating) :
    sort === "most-reviewed" ? desc(prompts.reviewCount) :
    sort === "price-low" ? asc(prompts.priceCents) :
    sort === "price-high" ? desc(prompts.priceCents) :
    sort === "free" ? asc(prompts.priceCents) :
    desc(prompts.publishedAt); // newest

  const rows = await db
    .select()
    .from(prompts)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(prompts)
    .where(and(...conditions));

  return NextResponse.json({ prompts: rows, total: count, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "creator" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Creator account required" }, { status: 403 });
  }

  const body = await req.json();
  const {
    title, subtitle, description, longDescription, category,
    tags: tagNames, fullContent, previewContent, difficulty, modelSupport,
    pricingType, priceCents, minPriceCents, slug,
    seoTitle, seoDescription, coverImageUrl, demoOutput, useCases, status,
  } = body;

  if (!title || !description || !fullContent || !previewContent || !slug) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Check slug uniqueness
  const existing = await db.select({ id: prompts.id }).from(prompts).where(eq(prompts.slug, slug)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Slug already taken — try a different title" }, { status: 409 });
  }

  // Insert prompt
  const [prompt] = await db.insert(prompts).values({
    creatorId: session.user.id,
    slug,
    title,
    subtitle: subtitle ?? null,
    description,
    longDescription: longDescription ?? description,
    category: category ?? "general",
    fullContent,
    previewContent,
    difficulty: difficulty ?? "intermediate",
    modelSupport: modelSupport ?? [],
    pricingType: pricingType ?? "paid",
    priceCents: priceCents ?? 0,
    minPriceCents: minPriceCents ?? null,
    seoTitle: seoTitle ?? title,
    seoDescription: seoDescription ?? description,
    coverImageUrl: coverImageUrl ?? null,
    demoOutputUrl: demoOutput ?? null,
    useCases: useCases ?? [],
    status: status ?? "pending",
    publishedAt: status === "published" ? new Date() : null,
  }).returning({ id: prompts.id });

  // Handle tags
  if (tagNames?.length > 0) {
    for (const name of tagNames.slice(0, 10)) {
      const tagSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      let [tag] = await db.select().from(tags).where(eq(tags.slug, tagSlug)).limit(1);
      if (!tag) {
        [tag] = await db.insert(tags).values({ slug: tagSlug, name, usageCount: 1 }).returning();
      } else {
        await db.update(tags).set({ usageCount: tag.usageCount + 1 }).where(eq(tags.id, tag.id));
      }
      await db.insert(promptTags).values({ promptId: prompt.id, tagId: tag.id }).onConflictDoNothing();
    }
  }

  return NextResponse.json({ id: prompt.id, slug });
}
