import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { purchases, prompts } from "@/db/schema";
import { eq, gte, and, sql, desc } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { formatPrice } from "@/lib/products";

async function getAnalyticsData(userId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Daily revenue for last 30 days
  const dailyRevenue = await db
    .select({
      date: sql<string>`date_trunc('day', ${purchases.createdAt})::date::text`,
      revenue: sql<number>`coalesce(sum(creator_earnings_cents), 0)::int`,
      sales: sql<number>`count(*)::int`,
    })
    .from(purchases)
    .where(and(eq(purchases.creatorId, userId), gte(purchases.createdAt, thirtyDaysAgo)))
    .groupBy(sql`date_trunc('day', ${purchases.createdAt})`)
    .orderBy(sql`date_trunc('day', ${purchases.createdAt})`);

  // Top prompts by revenue
  const topByRevenue = await db
    .select({
      title: prompts.title,
      slug: prompts.slug,
      revenue: sql<number>`coalesce(sum(creator_earnings_cents), 0)::int`,
      sales: sql<number>`count(*)::int`,
    })
    .from(purchases)
    .innerJoin(prompts, eq(purchases.promptId, prompts.id))
    .where(eq(purchases.creatorId, userId))
    .groupBy(prompts.id, prompts.title, prompts.slug)
    .orderBy(desc(sql`sum(creator_earnings_cents)`))
    .limit(5);

  // Monthly totals last 12 months
  const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const monthlyRevenue = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${purchases.createdAt}), 'Mon YYYY')`,
      revenue: sql<number>`coalesce(sum(creator_earnings_cents), 0)::int`,
      sales: sql<number>`count(*)::int`,
    })
    .from(purchases)
    .where(and(eq(purchases.creatorId, userId), gte(purchases.createdAt, twelveMonthsAgo)))
    .groupBy(sql`date_trunc('month', ${purchases.createdAt})`)
    .orderBy(sql`date_trunc('month', ${purchases.createdAt})`);

  return { dailyRevenue, topByRevenue, monthlyRevenue };
}

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/analytics");
  if (session.user.role !== "creator" && session.user.role !== "admin") redirect("/onboard");

  const { dailyRevenue, topByRevenue, monthlyRevenue } = await getAnalyticsData(session.user.id);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
        </div>
        <DashboardNav />

        <div className="mt-6 space-y-6">
          <AnalyticsCharts dailyRevenue={dailyRevenue} monthlyRevenue={monthlyRevenue} />

          {/* Top Performing Prompts */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white">Top Prompts by Revenue</h2>
            </div>
            {topByRevenue.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-500 text-sm">No sales yet.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {topByRevenue.map((p, i) => (
                  <div key={p.slug} className="px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-600 text-sm w-5">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{p.title}</p>
                        <p className="text-xs text-zinc-500">{p.sales} sales</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-emerald-400">{formatPrice(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
