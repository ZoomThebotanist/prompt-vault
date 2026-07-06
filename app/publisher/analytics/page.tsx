import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherPosts, publisherPostPlatforms } from "@/db/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import Link from "next/link";
import { PlatformIcon } from "@/components/publisher/platform-icon";
import type { PlatformSlug } from "@/lib/publisher/types";
import { PLATFORM_META } from "@/lib/publisher/types";
import { StatusBadge } from "@/components/publisher/status-badge";
import { TrendingUp, Send, CheckCircle, BarChart2 } from "lucide-react";

async function getAnalyticsData(userId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [postStats] = await db.select({
    total: sql<number>`count(*)::int`,
    published: sql<number>`count(*) filter (where status = 'published')::int`,
    failed: sql<number>`count(*) filter (where status = 'failed')::int`,
    scheduled: sql<number>`count(*) filter (where status in ('waiting','queued'))::int`,
  }).from(publisherPosts).where(eq(publisherPosts.userId, userId));

  const platformBreakdown = await db
    .select({
      platform: publisherPostPlatforms.platform,
      count: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where ${publisherPostPlatforms.status} = 'published')::int`,
      failed: sql<number>`count(*) filter (where ${publisherPostPlatforms.status} = 'failed')::int`,
    })
    .from(publisherPostPlatforms)
    .innerJoin(publisherPosts, eq(publisherPostPlatforms.postId, publisherPosts.id))
    .where(eq(publisherPosts.userId, userId))
    .groupBy(publisherPostPlatforms.platform);

  const recentPosts = await db
    .select({
      id: publisherPosts.id,
      title: publisherPosts.title,
      description: publisherPosts.description,
      status: publisherPosts.status,
      publishedAt: publisherPosts.publishedAt,
    })
    .from(publisherPosts)
    .where(and(eq(publisherPosts.userId, userId), eq(publisherPosts.status, "published")))
    .orderBy(desc(publisherPosts.publishedAt))
    .limit(10);

  const recentWithPlatforms = await Promise.all(
    recentPosts.map(async (post) => {
      const platforms = await db
        .select({ platform: publisherPostPlatforms.platform, publishedUrl: publisherPostPlatforms.publishedUrl })
        .from(publisherPostPlatforms)
        .where(eq(publisherPostPlatforms.postId, post.id));
      return { ...post, platforms };
    })
  );

  return { postStats, platformBreakdown, recentPosts: recentWithPlatforms };
}

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const data = await getAnalyticsData(session.user.id);
  const { postStats, platformBreakdown, recentPosts } = data;

  const successRate = postStats.total > 0
    ? Math.round((postStats.published / postStats.total) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-1">Publishing performance overview</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Posts", value: postStats.total, icon: Send, color: "text-zinc-300" },
          { label: "Published", value: postStats.published, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, color: "text-violet-400" },
          { label: "Platforms Active", value: platformBreakdown.length, icon: BarChart2, color: "text-blue-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-zinc-500">{label}</p>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Platform breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Platform Breakdown</h2>
          </div>
          {platformBreakdown.length === 0 ? (
            <div className="px-5 py-10 text-center text-zinc-600 text-sm">No data yet. Publish your first post.</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {platformBreakdown.map((row) => {
                const rate = row.count > 0 ? Math.round((row.published / row.count) * 100) : 0;
                return (
                  <div key={row.platform} className="px-5 py-3.5 flex items-center gap-3">
                    <PlatformIcon platform={row.platform as PlatformSlug} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-white">{PLATFORM_META[row.platform as PlatformSlug]?.label ?? row.platform}</p>
                        <span className="text-xs text-zinc-500">{row.published}/{row.count}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full transition-all"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-zinc-400 w-10 text-right">{rate}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Note about deep analytics */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col">
          <h2 className="font-semibold text-white mb-2">Engagement Metrics</h2>
          <p className="text-zinc-500 text-sm mb-4">
            Connect your platform analytics to see likes, comments, shares, reach, clicks, and conversion data per post.
          </p>
          <div className="bg-zinc-800 rounded-xl p-4 flex-1 flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm font-medium">Coming in next release</p>
              <p className="text-zinc-600 text-xs mt-1">Platform API metric collection in progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent published posts */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recently Published</h2>
          <Link href="/publisher/queue?status=published" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
        </div>
        {recentPosts.length === 0 ? (
          <div className="px-5 py-10 text-center text-zinc-600 text-sm">No published posts yet.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {recentPosts.map((post) => (
              <div key={post.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="flex gap-1">
                  {post.platforms.map((p) => <PlatformIcon key={p.platform} platform={p.platform as PlatformSlug} size="sm" />)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{post.title ?? post.description ?? "Untitled"}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                  </p>
                </div>
                <StatusBadge status={post.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
