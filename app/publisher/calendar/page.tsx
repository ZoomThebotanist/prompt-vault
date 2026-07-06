import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherPosts, publisherPostPlatforms } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import Link from "next/link";
import { StatusBadge } from "@/components/publisher/status-badge";
import { PlatformIcon } from "@/components/publisher/platform-icon";
import type { PlatformSlug } from "@/lib/publisher/types";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

function getMonthRange(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return { start, end };
}

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const { start, end } = getMonthRange(year, month);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { month: monthStr, year: yearStr } = await searchParams;
  const now = new Date();
  const year = yearStr ? parseInt(yearStr) : now.getFullYear();
  const month = monthStr ? parseInt(monthStr) : now.getMonth();

  const { start, end } = getMonthRange(year, month);

  const posts = await db
    .select({
      id: publisherPosts.id,
      title: publisherPosts.title,
      description: publisherPosts.description,
      status: publisherPosts.status,
      scheduledAt: publisherPosts.scheduledAt,
    })
    .from(publisherPosts)
    .where(
      and(
        eq(publisherPosts.userId, session.user.id),
        gte(publisherPosts.scheduledAt, start),
        lte(publisherPosts.scheduledAt, end)
      )
    );

  const postsWithPlatforms = await Promise.all(
    posts.map(async (post) => {
      const platforms = await db
        .select({ platform: publisherPostPlatforms.platform })
        .from(publisherPostPlatforms)
        .where(eq(publisherPostPlatforms.postId, post.id));
      return { ...post, platforms: platforms.map((p) => p.platform as PlatformSlug) };
    })
  );

  // Group by day
  const byDay: Record<string, typeof postsWithPlatforms> = {};
  for (const post of postsWithPlatforms) {
    if (!post.scheduledAt) continue;
    const key = new Date(post.scheduledAt).toISOString().slice(0, 10);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(post);
  }

  const days = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const prevMonth = month === 0 ? { month: 11, year: year - 1 } : { month: month - 1, year };
  const nextMonth = month === 11 ? { month: 0, year: year + 1 } : { month: month + 1, year };
  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <div className="flex items-center gap-1">
            <Link
              href={`/publisher/calendar?month=${prevMonth.month}&year=${prevMonth.year}`}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <span className="text-white font-medium px-2">{monthLabel}</span>
            <Link
              href={`/publisher/calendar?month=${nextMonth.month}&year=${nextMonth.year}`}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <Link
          href="/publisher/compose"
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Calendar grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Day labels */}
        <div className="grid grid-cols-7 border-b border-zinc-800">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="px-3 py-2.5 text-xs font-medium text-zinc-500 text-center">{d}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7">
          {/* Leading empty cells */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-zinc-800 bg-zinc-900/50" />
          ))}

          {days.map((day) => {
            const key = day.toISOString().slice(0, 10);
            const dayPosts = byDay[key] ?? [];
            const isToday = key === now.toISOString().slice(0, 10);
            const dayOfWeek = day.getDay();

            return (
              <div
                key={key}
                className={`min-h-[100px] border-b border-zinc-800 p-2 ${dayOfWeek === 6 ? "" : "border-r"} ${isToday ? "bg-violet-500/5" : ""}`}
              >
                <p className={`text-xs font-medium mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? "bg-violet-600 text-white" : "text-zinc-500"
                }`}>
                  {day.getDate()}
                </p>
                <div className="space-y-1">
                  {dayPosts.slice(0, 3).map((post) => (
                    <div key={post.id} className="bg-zinc-800 rounded px-1.5 py-1 text-xs">
                      <div className="flex items-center gap-1 mb-0.5">
                        {post.platforms.slice(0, 2).map((p) => <PlatformIcon key={p} platform={p} size="sm" />)}
                      </div>
                      <p className="text-zinc-300 truncate">{post.title ?? post.description ?? "Post"}</p>
                      <p className="text-zinc-600">{new Date(post.scheduledAt!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <p className="text-zinc-600 text-xs pl-1">+{dayPosts.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-violet-600 inline-block" /> Today</div>
        <p>Click a post to edit · Drag to reschedule (coming soon)</p>
      </div>
    </div>
  );
}
