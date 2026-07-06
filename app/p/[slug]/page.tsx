import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { prompts, creatorProfiles, reviews, purchases, user } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { formatPrice } from "@/lib/products";
import { BuyButton } from "@/components/buy-button";
import { ClaimButton } from "@/components/claim-button";
import { ReviewSection } from "@/components/reviews/review-section";
import { WishlistButton } from "@/components/wishlist-button";
import type { Metadata } from "next";

interface Props { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [prompt] = await db.select({ title: prompts.title, seoTitle: prompts.seoTitle, seoDescription: prompts.seoDescription })
    .from(prompts).where(eq(prompts.slug, slug)).limit(1);
  if (!prompt) return {};
  return {
    title: `${prompt.seoTitle ?? prompt.title} — PromptVault`,
    description: prompt.seoDescription ?? undefined,
  };
}

export default async function PromptPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const [prompt] = await db.select().from(prompts).where(and(eq(prompts.slug, slug), eq(prompts.status, "published"))).limit(1);
  if (!prompt) notFound();

  // Get creator info
  const [creator] = await db
    .select({ profile: creatorProfiles, userData: user })
    .from(creatorProfiles)
    .innerJoin(user, eq(creatorProfiles.userId, user.id))
    .where(eq(creatorProfiles.userId, prompt.creatorId))
    .limit(1);

  // Get reviews
  const promptReviews = await db
    .select({ review: reviews, reviewerName: user.name, reviewerImage: user.image })
    .from(reviews)
    .innerJoin(user, eq(reviews.reviewerId, user.id))
    .where(and(eq(reviews.promptId, prompt.id), eq(reviews.moderationStatus, "approved")))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  // Check if buyer has purchased
  let hasPurchased = false;
  let alreadyReviewed = false;
  if (session?.user) {
    const bought = await db.select({ id: purchases.id }).from(purchases)
      .where(and(eq(purchases.promptId, prompt.id), eq(purchases.buyerId, session.user.id)))
      .limit(1);
    hasPurchased = bought.length > 0;

    if (hasPurchased) {
      const reviewed = await db.select({ id: reviews.id }).from(reviews)
        .where(and(eq(reviews.promptId, prompt.id), eq(reviews.reviewerId, session.user.id)))
        .limit(1);
      alreadyReviewed = reviewed.length > 0;
    }
  }

  // Get related prompts
  const related = await db
    .select({ id: prompts.id, slug: prompts.slug, title: prompts.title, priceCents: prompts.priceCents, avgRating: prompts.avgRating, category: prompts.category })
    .from(prompts)
    .where(and(eq(prompts.category, prompt.category), eq(prompts.status, "published"), sql`${prompts.id} != ${prompt.id}`))
    .orderBy(desc(prompts.salesCount))
    .limit(3);

  // Track view
  // Note: fire-and-forget, we don't await this
  db.update(prompts).set({ viewCount: sql`view_count + 1` }).where(eq(prompts.id, prompt.id)).catch(() => {});

  const difficultyColors: Record<string, string> = {
    beginner: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    intermediate: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    advanced: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    expert: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/browse" className="hover:text-zinc-300 transition-colors">Browse</Link>
          <span>/</span>
          <Link href={`/browse?category=${prompt.category}`} className="hover:text-zinc-300 transition-colors capitalize">
            {prompt.category.replace("-", " ")}
          </Link>
          <span>/</span>
          <span className="text-zinc-400 truncate">{prompt.title}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Cover */}
        {prompt.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={prompt.coverImageUrl} alt={prompt.title} className="w-full h-56 object-cover rounded-xl mb-8 border border-zinc-800" />
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full capitalize">
                  {prompt.category.replace("-", " ")}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full border ${difficultyColors[prompt.difficulty] ?? ""}`}>
                  {prompt.difficulty}
                </span>
                {prompt.pricingType === "free" && (
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    Free
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight">{prompt.title}</h1>
              {prompt.subtitle && <p className="text-lg text-zinc-400 mt-2">{prompt.subtitle}</p>}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-zinc-500">
                {prompt.reviewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <span className="text-white font-medium">{Number(prompt.avgRating ?? 0).toFixed(1)}</span>
                    <span>({prompt.reviewCount} reviews)</span>
                  </span>
                )}
                {prompt.salesCount > 0 && (
                  <span>{prompt.salesCount} {prompt.salesCount === 1 ? "sale" : "sales"}</span>
                )}
                {prompt.viewCount > 0 && <span>{prompt.viewCount} views</span>}
              </div>

              {/* Creator */}
              {creator && (
                <Link href={`/creator/${creator.userData.username ?? creator.userData.id}`} className="flex items-center gap-3 mt-4 group w-fit">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold">
                    {creator.profile.displayName[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">
                      {creator.profile.displayName}
                      {creator.profile.verified && <span className="ml-1 text-violet-400">✓</span>}
                    </p>
                    {creator.profile.headline && (
                      <p className="text-xs text-zinc-500">{creator.profile.headline}</p>
                    )}
                  </div>
                </Link>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">About this prompt</h2>
              <p className="text-zinc-400 leading-relaxed">{prompt.description}</p>
              {prompt.longDescription !== prompt.description && (
                <div className="mt-4 text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.longDescription}
                </div>
              )}
            </div>

            {/* Use cases */}
            {prompt.useCases.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Use Cases</h2>
                <ul className="space-y-2">
                  {prompt.useCases.map((uc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <span className="text-violet-400 mt-0.5 shrink-0">▸</span>
                      {uc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium">Preview</p>
                <span className="text-xs text-zinc-600">🔒 Full content unlocked after purchase</span>
              </div>
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                {prompt.previewContent}
              </pre>
              <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <p className="text-xs text-zinc-600">
                  ~{Math.round(prompt.fullContent.split(/\s+/).filter(Boolean).length * 1.33)} tokens in full version
                </p>
                <p className="text-xs text-zinc-600">v{prompt.currentVersion}</p>
              </div>
            </div>

            {/* Demo output */}
            {prompt.demoOutputUrl && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Example Output</h2>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {prompt.demoOutputUrl}
                  </pre>
                </div>
              </div>
            )}

            {/* Supported models */}
            {prompt.modelSupport.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Supported AI Models</h2>
                <div className="flex flex-wrap gap-2">
                  {prompt.modelSupport.map((m) => (
                    <span key={m} className="text-sm bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <ReviewSection
              promptId={prompt.id}
              reviews={promptReviews.map(r => ({
                id: r.review.id,
                rating: r.review.rating,
                title: r.review.title,
                body: r.review.body,
                createdAt: r.review.createdAt.toISOString(),
                reviewerName: r.reviewerName,
                reviewerImage: r.reviewerImage,
                helpfulCount: r.review.helpfulCount,
                creatorReply: r.review.creatorReply,
              }))}
              canReview={hasPurchased && !alreadyReviewed}
              avgRating={prompt.avgRating ? Number(prompt.avgRating) : null}
              reviewCount={prompt.reviewCount}
            />

            {/* Related */}
            {related.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">More in {prompt.category.replace("-", " ")}</h2>
                <div className="grid sm:grid-cols-3 gap-3">
                  {related.map((r) => (
                    <Link key={r.id} href={`/p/${r.slug}`} className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 transition-all hover:-translate-y-0.5">
                      <p className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors line-clamp-2 mb-2">{r.title}</p>
                      <div className="flex items-center justify-between">
                        {r.avgRating && <span className="text-xs text-zinc-500">⭐ {Number(r.avgRating).toFixed(1)}</span>}
                        <span className="text-sm font-bold text-white">{formatPrice(r.priceCents)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
                <div className="mb-5">
                  {prompt.pricingType === "free" ? (
                    <div>
                      <p className="text-4xl font-bold text-emerald-400">Free</p>
                      <p className="text-xs text-zinc-500 mt-1">No payment required</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-4xl font-bold text-white">{formatPrice(prompt.priceCents)}</p>
                      <p className="text-xs text-zinc-500 mt-1">One-time purchase · Instant delivery</p>
                    </div>
                  )}
                </div>

                {hasPurchased ? (
                  <div className="space-y-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm text-emerald-400 text-center">
                      ✓ You own this prompt
                    </div>
                    <Link href="/purchases" className="block text-center text-sm text-zinc-400 hover:text-white transition-colors">
                      View in My Purchases →
                    </Link>
                  </div>
                ) : prompt.pricingType === "free" ? (
                  <ClaimButton promptId={prompt.id} />
                ) : (
                  <BuyButton
                    productId={prompt.id}
                    productSlug={prompt.slug}
                    isPrompt
                    pricingType={prompt.pricingType}
                    minPriceCents={prompt.minPriceCents}
                    priceCents={prompt.priceCents}
                  />
                )}

                <div className="mt-5 space-y-2.5 text-sm text-zinc-400">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>Full prompt delivered instantly</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>Commercial use license</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>Future version updates</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span>30-day satisfaction guarantee</span>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-zinc-800 flex items-center gap-3">
                  <WishlistButton promptId={prompt.id} />
                  <button className="flex-1 flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-800 hover:bg-zinc-700 rounded-lg py-2 px-3">
                    Share ↗
                  </button>
                </div>
              </div>

              {/* Prompt metadata */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Version</span>
                  <span className="text-zinc-300">{prompt.currentVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Difficulty</span>
                  <span className="text-zinc-300 capitalize">{prompt.difficulty}</span>
                </div>
                {prompt.estimatedTimeSavedMinutes && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Time saved</span>
                    <span className="text-zinc-300">~{prompt.estimatedTimeSavedMinutes}min</span>
                  </div>
                )}
                {prompt.publishedAt && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Published</span>
                    <span className="text-zinc-300">{new Date(prompt.publishedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
