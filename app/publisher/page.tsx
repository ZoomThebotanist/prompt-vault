import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  publisherPosts, publisherPostPlatforms, publisherAccounts, publishLogs
} from "@/db/schema";
import { eq, desc, sql, and, gte, inArray } from "drizzle-orm";
import Link from "next/link";
import { StatusBadge } from "@/components/publisher/status-badge";
import { PlatformIcon } from "@/components/publisher/platform-icon";
import type { PlatformSlug } from "@/lib/publisher/types";
import { PLATFORM_META } from "@/lib/publisher/types";
import { Plus, Zap, Send, Clock, AlertCircle, CheckCircle, Activity } from "lucide-react";

async function getOverviewData(userId: string) {
  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);

  const [publishedToday] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(publisherPosts)
    .where(and(eq(publisherPosts.userId, userId), eq(publisherPosts.status, "published"), gte(publisherPosts.publishedAt, todayStart)));

  const [scheduled] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(publisherPosts)
    .where(and(eq(publisherPosts.userId, userId), inArray(publisherPosts.status, ["waiting", "queued"])));

  const [failed] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(publisherPosts)
    .where(and(eq(publisherPosts.userId, userId), eq(publisherPosts.status, "failed")));

  const [totalPosts] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(publisherPosts)
    .where(eq(publisherPosts.userId, userId));

  const nextUp = await db
    .select({ id: publisherPosts.id, title: publisherPosts.title, description: publisherPosts.description, scheduledAt: publisherPosts.scheduledAt, status: publisherPosts.status })
    .from(publisherPosts)
    .where(and(eq(publisherPosts.userId, userId), inArray(publisherPosts.status, ["waiting", "queued", "draft"])))
    .orderBy(publisherPosts.scheduledAt)
    .limit(5);

  const nextUpWithPlatforms = await Promise.all(
    nextUp.map(async (post) => {
      const platforms = await db
        .select({ platform: publisherPostPlatforms.platform })
        .from(publisherPostPlatforms)
        .where(eq(publisherPostPlatforms.postId, post.id));
      return { ...post, platforms: platforms.map((p) => p.platform as PlatformSlug) };
    })
  );

  const recentActivity = await db
    .select({
      id: publishLogs.id,
      success: publishLogs.success,
      attemptedAt: publishLogs.attemptedAt,
      platform: publisherPostPlatforms.platform,
      postTitle: publisherPosts.title,
      postDesc: publisherPosts.description,
      latencyMs: publishLogs.latencyMs,
      errorMessage: publishLogs.errorMessage,
    })
    .from(publishLogs)
    .innerJoin(publisherPostPlatforms, eq(publishLogs.postPlatformId, publisherPostPlatforms.id))
    .innerJoin(publisherPosts, eq(publisherPostPlatforms.postId, publisherPosts.id))
    .where(eq(publisherPosts.userId, userId))
    .orderBy(desc(publishLogs.attemptedAt))
    .limit(8);

  const connectedAccounts = await db
    .select({ platform: publisherAccounts.platform, accountHandle: publisherAccounts.accountHandle, isActive: publisherAccounts.isActive })
    .from(publisherAccounts)
    .where(eq(publisherAccounts.userId, userId));

  return { publishedToday: publishedToday.count, scheduled: scheduled.count, failed: failed.count, totalPosts: totalPosts.count, nextUp: nextUpWithPlatforms, recentActivity, connectedAccounts };
}

function StatCard({ label, value, sub, icon: Icon, color = "zinc" }: { label: string; value: string | number; sub?: string; icon: React.ElementType; color?: string }) {
  const colors: Record<string, string> = {
    zinc: "text-zinc-300",
    violet: "text-violet-400",
    emerald: "text-emerald-400",
    red: "text-red-400",
    amber: "text-amber-400",
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-zinc-500">{label}</p>
        <Icon className={`w-4 h-4 ${colors[color]}`} />
      </div>
      <p className={`text-2xl font-bold ${colors[color]}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
}

function formatTime(date: Date | null | string) {
  if (!date) return "—";
  const d = new Date(date);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default async function PublisherOverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const data = await getOverviewData(session.user.id);

  const SUPPORTED_PLATFORMS: PlatformSlug[] = ["x", "reddit", "linkedin", "instagram", "tiktok", "bluesky"];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Publisher Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <Link
          href="/publisher/compose"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Published Today" value={data.publishedToday} sub="posts sent" icon={CheckCircle} color="emerald" />
        <StatCard label="Scheduled" value={data.scheduled} sub="in queue" icon={Clock} color="amber" />
        <StatCard label="Failed" value={data.failed} sub="need attention" icon={AlertCircle} color={data.failed > 0 ? "red" : "zinc"} />
        <StatCard label="Total Posts" value={data.totalPosts} sub="all time" icon={Send} color="violet" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Next Up */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Next Up</h2>
            <Link href="/publisher/queue" className="text-xs text-violet-400 hover:text-violet-300">View queue →</Link>
          </div>
          {data.nextUp.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Send className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500 text-sm">No posts scheduled.</p>
              <Link href="/publisher/compose" className="text-violet-400 text-sm hover:text-violet-300 mt-2 inline-block">
                Compose your first post →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {data.nextUp.map((post) => (
                <div key={post.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-zinc-800/40 transition-colors">
                  <div className="flex gap-1">
                    {post.platforms.map((p) => <PlatformIcon key={p} platform={p} size="sm" />)}
                    {post.platforms.length === 0 && <span className="text-zinc-600 text-xs">No platforms</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{post.title ?? post.description ?? "Untitled post"}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{formatTime(post.scheduledAt)}</p>
                  </div>
                  <StatusBadge status={post.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Platform Health */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Platform Health</h2>
          </div>
          <div className="p-4 space-y-2">
            {SUPPORTED_PLATFORMS.map((platform) => {
              const connected = data.connectedAccounts.find((a) => a.platform === platform);
              const meta = PLATFORM_META[platform];
              return (
                <div key={platform} className="flex items-center gap-3 py-1.5">
                  <PlatformIcon platform={platform} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-300 truncate">{meta.label}</p>
                    {connected && <p className="text-[10px] text-zinc-600 truncate">@{connected.accountHandle}</p>}
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${connected ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700/50 text-zinc-500"}`}>
                    {connected ? "Connected" : "Not set"}
                  </span>
                </div>
              );
            })}
            <Link href="/publisher/accounts" className="block text-center text-xs text-violet-400 hover:text-violet-300 pt-2">
              Manage accounts →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-zinc-500" />
          <h2 className="font-semibold text-white">Recent Activity</h2>
        </div>
        {data.recentActivity.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-zinc-600 text-sm">No activity yet. Publish your first post to see logs here.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {data.recentActivity.map((log) => (
              <div key={log.id} className="px-5 py-3 flex items-center gap-3">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5 ${log.success ? "bg-emerald-400" : "bg-red-400"}`} />
                <PlatformIcon platform={log.platform as PlatformSlug} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 truncate">{log.postTitle ?? log.postDesc ?? "Untitled"}</p>
                  {!log.success && log.errorMessage && (
                    <p className="text-xs text-red-400 truncate mt-0.5">{log.errorMessage}</p>
                  )}
                </div>
                <span className="text-xs text-zinc-600 whitespace-nowrap">{formatTime(log.attemptedAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
