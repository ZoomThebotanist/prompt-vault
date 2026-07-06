import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherPosts, publisherPostPlatforms } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import { StatusBadge } from "@/components/publisher/status-badge";
import { PlatformIcon } from "@/components/publisher/platform-icon";
import type { PlatformSlug, PostStatus } from "@/lib/publisher/types";
import { Plus, RefreshCw, Send } from "lucide-react";
import { QueueActions } from "@/components/publisher/queue-actions";

const STATUS_TABS: { key: "all" | PostStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "waiting", label: "Scheduled" },
  { key: "published", label: "Published" },
  { key: "failed", label: "Failed" },
  { key: "draft", label: "Drafts" },
];

async function getQueueData(userId: string, status: string) {
  const where = status === "all"
    ? eq(publisherPosts.userId, userId)
    : inArray(publisherPosts.status, [status as PostStatus]);

  const posts = await db
    .select({
      id: publisherPosts.id,
      title: publisherPosts.title,
      description: publisherPosts.description,
      status: publisherPosts.status,
      scheduledAt: publisherPosts.scheduledAt,
      publishedAt: publisherPosts.publishedAt,
      priority: publisherPosts.priority,
      createdAt: publisherPosts.createdAt,
    })
    .from(publisherPosts)
    .where(eq(publisherPosts.userId, userId))
    .orderBy(desc(publisherPosts.createdAt))
    .limit(100);

  const filteredPosts = status === "all"
    ? posts
    : posts.filter((p) => p.status === status);

  const postsWithPlatforms = await Promise.all(
    filteredPosts.map(async (post) => {
      const platforms = await db
        .select({ platform: publisherPostPlatforms.platform, status: publisherPostPlatforms.status, publishedUrl: publisherPostPlatforms.publishedUrl })
        .from(publisherPostPlatforms)
        .where(eq(publisherPostPlatforms.postId, post.id));
      return { ...post, platforms };
    })
  );

  return postsWithPlatforms;
}

function formatDateTime(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function QueuePage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { status = "all" } = await searchParams;
  const posts = await getQueueData(session.user.id, status);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Publishing Queue</h1>
          <p className="text-zinc-500 text-sm mt-1">{posts.length} posts</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/publisher/queue"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </Link>
          <Link
            href="/publisher/compose"
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-0.5 border-b border-zinc-800 mb-6 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/publisher/queue?status=${tab.key}`}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              status === tab.key
                ? "border-violet-500 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Queue table */}
      {posts.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl py-16 text-center">
          <Send className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">No posts here yet</p>
          <p className="text-zinc-600 text-sm mt-1">Create your first post to get started</p>
          <Link href="/publisher/compose" className="inline-flex items-center gap-2 mt-4 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Compose Post
          </Link>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Post</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Platforms</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Scheduled</th>
                <th className="px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-5 py-3.5">
                    <p className="text-white font-medium truncate max-w-xs">{post.title ?? post.description ?? "Untitled"}</p>
                    <p className="text-zinc-600 text-xs mt-0.5 truncate max-w-xs">{post.description?.slice(0, 60)}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {post.platforms.length === 0
                        ? <span className="text-zinc-600 text-xs">None</span>
                        : post.platforms.map((p) => (
                          <PlatformIcon key={p.platform} platform={p.platform as PlatformSlug} size="sm" />
                        ))
                      }
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3.5 text-zinc-400 hidden lg:table-cell whitespace-nowrap">
                    {formatDateTime(post.scheduledAt ?? post.publishedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <QueueActions postId={post.id} status={post.status as PostStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
