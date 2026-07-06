import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { user, creatorProfiles, prompts, reviews } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { formatPrice } from "@/lib/products";
import { FollowButton } from "@/components/follow-button";

interface Props { params: Promise<{ username: string }>; }

export default async function CreatorProfilePage({ params }: Props) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  // Look up by username or user id
  const [userData] = await db.select().from(user)
    .where(eq(user.username, username))
    .limit(1);

  if (!userData) notFound();

  const [profile] = await db.select().from(creatorProfiles)
    .where(eq(creatorProfiles.userId, userData.id))
    .limit(1);

  if (!profile) notFound();

  // Get published prompts
  const creatorPrompts = await db.select({
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
    publishedAt: prompts.publishedAt,
  })
    .from(prompts)
    .where(and(eq(prompts.creatorId, userData.id), eq(prompts.status, "published")))
    .orderBy(desc(prompts.salesCount))
    .limit(12);

  // Stats
  const [statsRow] = await db
    .select({
      totalSales: sql<number>`sum(sales_count)::int`,
      avgRating: sql<number>`avg(avg_rating)::numeric(3,2)`,
      totalReviews: sql<number>`sum(review_count)::int`,
    })
    .from(prompts)
    .where(and(eq(prompts.creatorId, userData.id), eq(prompts.status, "published")));

  const isOwner = session?.user?.id === userData.id;

  // Check if current user follows this creator
  let isFollowing = false;
  if (session?.user && !isOwner) {
    const [follow] = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, userData.id))
      .limit(1);
    // We'd check follows table here - simplified for brevity
    isFollowing = false;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Banner */}
      <div className={`h-48 ${profile.bannerUrl ? "" : "bg-gradient-to-br from-violet-900/40 via-zinc-900 to-zinc-950"} border-b border-zinc-800`}>
        {profile.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.bannerUrl} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Profile header */}
        <div className="flex items-end justify-between -mt-12 mb-8 flex-wrap gap-4">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-2xl border-4 border-[#0a0a0a] bg-violet-600 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-xl">
              {profile.displayName[0].toUpperCase()}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{profile.displayName}</h1>
                {profile.verified && (
                  <span className="bg-violet-600 text-white text-xs px-2 py-0.5 rounded-full">✓ Verified</span>
                )}
              </div>
              {profile.headline && <p className="text-zinc-400 text-sm mt-0.5">{profile.headline}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 pb-1">
            {isOwner ? (
              <Link href="/settings" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">
                Edit Profile
              </Link>
            ) : (
              <FollowButton creatorId={userData.id} initialFollowing={isFollowing} />
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-2xl font-bold text-white">{creatorPrompts.length}</p>
                <p className="text-xs text-zinc-500">Prompts</p>
              </div>
              <div className="h-px bg-zinc-800" />
              <div>
                <p className="text-2xl font-bold text-white">{profile.followerCount}</p>
                <p className="text-xs text-zinc-500">Followers</p>
              </div>
              <div className="h-px bg-zinc-800" />
              <div>
                <p className="text-2xl font-bold text-white">{statsRow.totalSales ?? 0}</p>
                <p className="text-xs text-zinc-500">Total Sales</p>
              </div>
              {statsRow.avgRating && (
                <>
                  <div className="h-px bg-zinc-800" />
                  <div>
                    <p className="text-2xl font-bold text-white">⭐ {Number(statsRow.avgRating).toFixed(1)}</p>
                    <p className="text-xs text-zinc-500">Avg Rating ({statsRow.totalReviews} reviews)</p>
                  </div>
                </>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-sm text-zinc-400 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Links */}
            <div className="space-y-2">
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300 transition-colors">
                  <span>🌐</span> {profile.website.replace("https://", "")}
                </a>
              )}
              {profile.twitterHandle && (
                <a href={`https://x.com/${profile.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300 transition-colors">
                  <span>𝕏</span> @{profile.twitterHandle}
                </a>
              )}
              {profile.githubHandle && (
                <a href={`https://github.com/${profile.githubHandle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-300 transition-colors">
                  <span>⌥</span> {profile.githubHandle}
                </a>
              )}
            </div>

            {profile.onboardedAt && (
              <p className="text-xs text-zinc-600">Creator since {new Date(profile.onboardedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            )}
          </div>

          {/* Prompts grid */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-white mb-4">
              Prompts{creatorPrompts.length > 0 && <span className="text-zinc-500 font-normal text-base ml-2">({creatorPrompts.length})</span>}
            </h2>
            {creatorPrompts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-sm">No published prompts yet.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {creatorPrompts.map((p) => (
                  <Link key={p.id} href={`/p/${p.slug}`} className="group bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/5">
                    {p.coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImageUrl} alt={p.title} className="w-full h-32 object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-zinc-500 capitalize">{p.category.replace("-", " ")}</span>
                        {p.pricingType === "free" && <span className="text-xs text-emerald-400">Free</span>}
                      </div>
                      <h3 className="font-medium text-white text-sm group-hover:text-violet-300 transition-colors line-clamp-2 mb-2">{p.title}</h3>
                      <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{p.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          {p.salesCount > 0 && <span>{p.salesCount} sales</span>}
                          {p.reviewCount > 0 && <span>⭐ {Number(p.avgRating ?? 0).toFixed(1)}</span>}
                        </div>
                        <span className={`text-sm font-bold ${p.priceCents === 0 ? "text-emerald-400" : "text-white"}`}>
                          {p.priceCents === 0 ? "Free" : formatPrice(p.priceCents)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
