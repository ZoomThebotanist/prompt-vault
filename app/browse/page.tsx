import { Suspense } from "react";
import { db } from "@/db";
import { prompts, creatorProfiles, user } from "@/db/schema";
import { eq, and, ilike, desc, asc, sql, inArray } from "drizzle-orm";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { BrowseFilters } from "@/components/browse/browse-filters";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "developer-tools", label: "Dev Tools" },
  { value: "game-dev", label: "Game Dev" },
  { value: "marketing", label: "Marketing" },
  { value: "design", label: "Design" },
  { value: "business", label: "Business" },
  { value: "education", label: "Education" },
  { value: "productivity", label: "Productivity" },
  { value: "writing", label: "Writing" },
  { value: "data-analysis", label: "Data" },
  { value: "research", label: "Research" },
  { value: "general", label: "General" },
];

interface BrowseProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    page?: string;
    pricing?: string;
  }>;
}

async function PromptGrid({ category, q, sort, page, pricing }: {
  category: string; q?: string; sort: string; page: number; pricing?: string;
}) {
  const limit = 24;
  const offset = (page - 1) * limit;

  const conditions = [eq(prompts.status, "published")];
  if (category && category !== "all") conditions.push(eq(prompts.category, category));
  if (q) conditions.push(ilike(prompts.title, `%${q}%`));
  if (pricing === "free") conditions.push(eq(prompts.priceCents, 0));
  if (pricing === "paid") conditions.push(sql`${prompts.priceCents} > 0`);
  if (pricing === "under10") conditions.push(sql`${prompts.priceCents} < 1000 AND ${prompts.priceCents} > 0`);

  const orderBy =
    sort === "trending" ? desc(prompts.salesCount) :
    sort === "top-rated" ? desc(prompts.avgRating) :
    sort === "price-low" ? asc(prompts.priceCents) :
    sort === "price-high" ? desc(prompts.priceCents) :
    sort === "most-reviewed" ? desc(prompts.reviewCount) :
    desc(prompts.publishedAt);

  const rows = await db
    .select({
      id: prompts.id,
      slug: prompts.slug,
      title: prompts.title,
      description: prompts.description,
      priceCents: prompts.priceCents,
      pricingType: prompts.pricingType,
      category: prompts.category,
      difficulty: prompts.difficulty,
      salesCount: prompts.salesCount,
      avgRating: prompts.avgRating,
      reviewCount: prompts.reviewCount,
      coverImageUrl: prompts.coverImageUrl,
      modelSupport: prompts.modelSupport,
      creatorId: prompts.creatorId,
      publishedAt: prompts.publishedAt,
    })
    .from(prompts)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

  // Get creator info for each prompt
  const creatorIds = [...new Set(rows.map(r => r.creatorId))];
  const creators = creatorIds.length > 0 ? await db
    .select({ userId: creatorProfiles.userId, displayName: creatorProfiles.displayName, avatarUrl: creatorProfiles.avatarUrl })
    .from(creatorProfiles)
    .where(inArray(creatorProfiles.userId, creatorIds)) : [];

  const creatorMap = new Map(creators.map(c => [c.userId, c]));

  if (rows.length === 0) {
    return (
      <div className="col-span-full text-center py-16 text-zinc-500">
        {q ? `No prompts found for "${q}"` : "No prompts in this category yet."}
      </div>
    );
  }

  return (
    <>
      {rows.map((p) => {
        const creator = creatorMap.get(p.creatorId);
        return (
          <Link key={p.id} href={`/p/${p.slug}`} className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-violet-500/5 hover:-translate-y-0.5">
            {p.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.coverImageUrl} alt={p.title} className="w-full h-40 object-cover" />
            ) : (
              <div className="w-full h-28 bg-gradient-to-br from-violet-900/30 to-zinc-900 flex items-center justify-center">
                <span className="text-4xl opacity-30">✦</span>
              </div>
            )}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full capitalize">
                  {p.category.replace("-", " ")}
                </span>
                {p.pricingType === "free" && (
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Free</span>
                )}
              </div>
              <h3 className="font-semibold text-white text-sm leading-tight group-hover:text-violet-300 transition-colors line-clamp-2 mb-1.5">
                {p.title}
              </h3>
              <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-3">{p.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {creator && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                        {creator.displayName[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-zinc-500">{creator.displayName}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {p.reviewCount > 0 && (
                    <span className="text-xs text-zinc-500">⭐ {Number(p.avgRating ?? 0).toFixed(1)}</span>
                  )}
                  <span className={`text-sm font-bold ${p.priceCents === 0 ? "text-emerald-400" : "text-white"}`}>
                    {p.priceCents === 0 ? "Free" : formatPrice(p.priceCents)}
                  </span>
                </div>
              </div>
              {p.salesCount > 0 && (
                <p className="text-xs text-zinc-600 mt-1.5">{p.salesCount} {p.salesCount === 1 ? "sale" : "sales"}</p>
              )}
            </div>
          </Link>
        );
      })}
    </>
  );
}

export default async function BrowsePage({ searchParams }: BrowseProps) {
  const { category = "all", q, sort = "newest", page = "1", pricing } = await searchParams;
  const pageNum = parseInt(page);

  const totalCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(prompts)
    .where(eq(prompts.status, "published"));

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div className="border-b border-zinc-800 bg-zinc-950 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Browse Prompts</h1>
          <p className="text-zinc-400">Discover {totalCount[0]?.count ?? 0}+ expert-engineered AI prompt systems</p>

          {/* Search */}
          <form className="mt-5 flex gap-3 max-w-xl" action="/browse" method="GET">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search prompts..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
            <input type="hidden" name="category" value={category} />
            <button type="submit" className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Category tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              href={`/browse?category=${cat.value}${q ? `&q=${q}` : ""}&sort=${sort}`}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                category === cat.value
                  ? "bg-violet-600 text-white font-medium"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Filters + Sort */}
        <Suspense>
          <BrowseFilters currentSort={sort} currentPricing={pricing} />
        </Suspense>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          <Suspense
            fallback={<div className="col-span-full text-center py-16 text-zinc-500">Loading...</div>}
          >
            <PromptGrid category={category} q={q} sort={sort} page={pageNum} pricing={pricing} />
          </Suspense>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-10">
          {pageNum > 1 && (
            <Link href={`/browse?category=${category}&sort=${sort}&page=${pageNum - 1}${q ? `&q=${q}` : ""}`} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
              ← Previous
            </Link>
          )}
          <Link href={`/browse?category=${category}&sort=${sort}&page=${pageNum + 1}${q ? `&q=${q}` : ""}`} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors">
            Next →
          </Link>
        </div>
      </div>
    </div>
  );
}
