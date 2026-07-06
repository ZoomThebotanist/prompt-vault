import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/db";
import { prompts, creatorProfiles } from "@/db/schema";
import { eq, desc, sql, inArray } from "drizzle-orm";
import { formatPrice } from "@/lib/products";

export const revalidate = 60;

const CATEGORIES = [
  { value: "developer-tools", label: "Dev Tools", icon: "⌨️" },
  { value: "marketing", label: "Marketing", icon: "📢" },
  { value: "game-dev", label: "Game Dev", icon: "🎮" },
  { value: "writing", label: "Writing", icon: "✍️" },
  { value: "business", label: "Business", icon: "💼" },
  { value: "design", label: "Design", icon: "🎨" },
];

async function HomeHero() {
  const [promptCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(prompts)
    .where(eq(prompts.status, "published"));

  const [creatorCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(creatorProfiles);

  return (
    <section className="relative overflow-hidden border-b border-zinc-800">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 py-20 text-center relative">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-1.5 text-xs text-zinc-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {promptCount.count} prompts from {creatorCount.count} creators
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-tight mb-5">
          The marketplace for{" "}
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            expert AI prompts
          </span>
        </h1>
        <p className="text-zinc-400 text-xl max-w-xl mx-auto mb-8">
          Buy battle-tested prompts from expert creators. Sell your own. Start earning today.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/browse" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base">
            Browse Prompts →
          </Link>
          <Link href="/onboard" className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-base border border-zinc-700">
            Start Selling
          </Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{creatorCount.count}+</p>
            <p>Creators</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{promptCount.count}+</p>
            <p>Prompts</p>
          </div>
          <div className="w-px h-8 bg-zinc-800" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">80%</p>
            <p>Creator earnings</p>
          </div>
        </div>
      </div>
    </section>
  );
}

async function FeaturedGrid() {
  const featured = await db
    .select({
      id: prompts.id,
      slug: prompts.slug,
      title: prompts.title,
      description: prompts.description,
      priceCents: prompts.priceCents,
      pricingType: prompts.pricingType,
      category: prompts.category,
      salesCount: prompts.salesCount,
      avgRating: prompts.avgRating,
      reviewCount: prompts.reviewCount,
      coverImageUrl: prompts.coverImageUrl,
      creatorId: prompts.creatorId,
    })
    .from(prompts)
    .where(eq(prompts.status, "published"))
    .orderBy(desc(prompts.salesCount))
    .limit(6);

  if (featured.length === 0) {
    return (
      <div className="col-span-full text-center py-12 border border-dashed border-zinc-800 rounded-xl">
        <p className="text-zinc-600 text-sm">No prompts yet.</p>
        <Link href="/upload" className="text-violet-400 hover:text-violet-300 text-sm mt-2 inline-block">
          Upload the first one →
        </Link>
      </div>
    );
  }

  const creatorIds = [...new Set(featured.map(f => f.creatorId))];
  const creators = await db
    .select({ userId: creatorProfiles.userId, displayName: creatorProfiles.displayName })
    .from(creatorProfiles)
    .where(inArray(creatorProfiles.userId, creatorIds));

  const creatorMap = new Map(creators.map(c => [c.userId, c.displayName]));

  return (
    <>
      {featured.map((p) => (
        <Link
          key={p.id}
          href={`/p/${p.slug}`}
          className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5"
        >
          <div className="h-28 bg-gradient-to-br from-violet-900/30 to-zinc-900 flex items-center justify-center">
            <span className="text-3xl opacity-20">✦</span>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-zinc-500 capitalize">{p.category.replace(/-/g, " ")}</span>
              {p.pricingType === "free" && <span className="text-xs text-emerald-400">Free</span>}
            </div>
            <h3 className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors line-clamp-2 mb-1.5">
              {p.title}
            </h3>
            <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">{p.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                {creatorMap.get(p.creatorId) && (
                  <>
                    <div className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {creatorMap.get(p.creatorId)![0].toUpperCase()}
                    </div>
                    <span>{creatorMap.get(p.creatorId)}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {p.reviewCount > 0 && <span className="text-xs text-zinc-500">⭐ {Number(p.avgRating ?? 0).toFixed(1)}</span>}
                <span className={`text-sm font-bold ${p.priceCents === 0 ? "text-emerald-400" : "text-white"}`}>
                  {p.priceCents === 0 ? "Free" : formatPrice(p.priceCents)}
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Suspense fallback={
        <div className="border-b border-zinc-800 px-6 py-20 text-center">
          <div className="w-48 h-8 bg-zinc-800 rounded mx-auto animate-pulse" />
        </div>
      }>
        <HomeHero />
      </Suspense>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Browse by Category</h2>
          <Link href="/browse" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">View all →</Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat.value} href={`/browse?category=${cat.value}`} className="group bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 rounded-xl p-4 text-center transition-all hover:-translate-y-0.5">
              <div className="text-2xl mb-2">{cat.icon}</div>
              <p className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">{cat.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured prompts */}
      <section className="max-w-6xl mx-auto px-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Top Prompts</h2>
          <Link href="/browse?sort=trending" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">See all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Suspense fallback={
            <div className="col-span-3 grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl h-48 animate-pulse" />
              ))}
            </div>
          }>
            <FeaturedGrid />
          </Suspense>
        </div>
      </section>

      {/* Creator CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-violet-900/30 to-zinc-900 border border-violet-500/20 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to earn from your prompts?</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Join thousands of creators earning on PromptVault. Set up your store in 2 minutes. Keep 80% of every sale.
          </p>
          <Link href="/onboard" className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base">
            Become a Creator →
          </Link>
        </div>
      </section>

      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="text-white font-bold">Prompt<span className="text-violet-400">Vault</span></span>
          <div className="flex items-center gap-5 text-sm text-zinc-500">
            <Link href="/browse" className="hover:text-zinc-300 transition-colors">Browse</Link>
            <Link href="/onboard" className="hover:text-zinc-300 transition-colors">Sell</Link>
            <a href="mailto:support@promptvault.dev" className="hover:text-zinc-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
