import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { prompts, purchases, reviews, follows, creatorProfiles } from "@/db/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

async function getDashboardStats(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totalRevenue] = await db
    .select({ sum: sql<number>`coalesce(sum(creator_earnings_cents), 0)::int` })
    .from(purchases)
    .where(eq(purchases.creatorId, userId));

  const [monthRevenue] = await db
    .select({ sum: sql<number>`coalesce(sum(creator_earnings_cents), 0)::int` })
    .from(purchases)
    .where(and(eq(purchases.creatorId, userId), gte(purchases.createdAt, thirtyDaysAgo)));

  const [weekSales] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(purchases)
    .where(and(eq(purchases.creatorId, userId), gte(purchases.createdAt, sevenDaysAgo)));

  const [totalSales] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(purchases)
    .where(eq(purchases.creatorId, userId));

  const [followerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.creatorId, userId));

  const [reviewStats] = await db
    .select({
      count: sql<number>`count(*)::int`,
      avg: sql<number>`coalesce(avg(rating), 0)::numeric(3,2)`,
    })
    .from(reviews)
    .innerJoin(prompts, eq(reviews.promptId, prompts.id))
    .where(eq(prompts.creatorId, userId));

  const publishedPrompts = await db
    .select({ id: prompts.id, title: prompts.title, slug: prompts.slug, priceCents: prompts.priceCents, salesCount: prompts.salesCount, avgRating: prompts.avgRating, reviewCount: prompts.reviewCount, status: prompts.status })
    .from(prompts)
    .where(eq(prompts.creatorId, userId))
    .orderBy(desc(prompts.salesCount))
    .limit(5);

  const recentPurchases = await db
    .select({ id: purchases.id, customerEmail: purchases.customerEmail, amountCents: purchases.amountCents, creatorEarningsCents: purchases.creatorEarningsCents, createdAt: purchases.createdAt, promptTitle: prompts.title })
    .from(purchases)
    .leftJoin(prompts, eq(purchases.promptId, prompts.id))
    .where(eq(purchases.creatorId, userId))
    .orderBy(desc(purchases.createdAt))
    .limit(5);

  return {
    totalRevenueCents: totalRevenue.sum,
    monthRevenueCents: monthRevenue.sum,
    weekSales: weekSales.count,
    totalSales: totalSales.count,
    followerCount: followerCount.count,
    reviewCount: reviewStats.count,
    avgRating: reviewStats.avg,
    publishedPrompts,
    recentPurchases,
  };
}

function StatCard({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-sm text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      {trend && <p className="text-xs text-emerald-400 mt-1">{trend}</p>}
    </div>
  );
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/dashboard");
  if (session.user.role !== "creator" && session.user.role !== "admin") redirect("/onboard");

  const { welcome } = await searchParams;
  const stats = await getDashboardStats(session.user.id);

  const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, session.user.id)).limit(1);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {welcome && (
          <div className="mb-6 bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-violet-300 font-medium">Welcome to your creator dashboard! 🎉</p>
              <p className="text-violet-400/70 text-sm mt-0.5">You&apos;re all set. Upload your first prompt to get started.</p>
            </div>
            <Link href="/upload">
              <button className="bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                Upload Prompt →
              </button>
            </Link>
          </div>
        )}

        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
            <p className="text-zinc-400 text-sm mt-1">Welcome back, {profile?.displayName ?? session.user.name}</p>
          </div>
          <Link href="/upload" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + New Prompt
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Revenue" value={formatPrice(stats.totalRevenueCents)} sub="lifetime earnings" />
          <StatCard label="This Month" value={formatPrice(stats.monthRevenueCents)} sub="last 30 days" />
          <StatCard label="Total Sales" value={stats.totalSales.toString()} sub={`${stats.weekSales} this week`} />
          <StatCard label="Followers" value={stats.followerCount.toString()} sub={stats.avgRating ? `⭐ ${Number(stats.avgRating).toFixed(1)} avg rating` : "No reviews yet"} />
        </div>

        <DashboardNav />

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Top prompts */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">Your Prompts</h2>
              <Link href="/dashboard/prompts" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
            </div>
            {stats.publishedPrompts.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-500 text-sm">No prompts yet.</p>
                <Link href="/upload" className="text-violet-400 text-sm hover:text-violet-300 mt-2 inline-block">Upload your first →</Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {stats.publishedPrompts.map((p) => (
                  <div key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{p.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {p.salesCount} sales · {p.reviewCount} reviews
                        {p.avgRating ? ` · ⭐ ${Number(p.avgRating).toFixed(1)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-emerald-500/10 text-emerald-400" : p.status === "pending" ? "bg-amber-500/10 text-amber-400" : "bg-zinc-700 text-zinc-400"}`}>
                        {p.status}
                      </span>
                      <span className="text-sm font-medium text-white">{formatPrice(p.priceCents)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent sales */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">Recent Sales</h2>
              <Link href="/dashboard/customers" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
            </div>
            {stats.recentPurchases.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-zinc-500 text-sm">No sales yet.</p>
                <p className="text-zinc-600 text-xs mt-1">Sales will appear here once customers start buying.</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {stats.recentPurchases.map((p) => (
                  <div key={p.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{p.promptTitle ?? "Legacy product"}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{p.customerEmail}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-sm font-medium text-emerald-400">+{formatPrice(p.creatorEarningsCents)}</p>
                      <p className="text-xs text-zinc-600">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/upload", icon: "📝", label: "New Prompt" },
            { href: "/dashboard/analytics", icon: "📊", label: "Analytics" },
            { href: "/dashboard/customers", icon: "👥", label: "Customers" },
            { href: "/dashboard/payouts", icon: "💸", label: "Payouts" },
          ].map((a) => (
            <Link key={a.href} href={a.href} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 text-center transition-colors group">
              <div className="text-2xl mb-2">{a.icon}</div>
              <p className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">{a.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
