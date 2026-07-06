import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { prompts, user, purchases, creatorProfiles, creatorApplications } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { AdminActions } from "@/components/admin/admin-actions";
import { CreatorApplicationActions } from "@/components/admin/creator-application-actions";

async function getAdminStats() {
  const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(user);
  const [totalPrompts] = await db.select({ count: sql<number>`count(*)::int` }).from(prompts).where(eq(prompts.status, "published"));
  const [pendingPrompts] = await db.select({ count: sql<number>`count(*)::int` }).from(prompts).where(eq(prompts.status, "pending"));
  const [totalRevenue] = await db.select({ sum: sql<number>`coalesce(sum(amount_cents), 0)::int` }).from(purchases);
  const [pendingApps] = await db.select({ count: sql<number>`count(*)::int` }).from(creatorApplications).where(eq(creatorApplications.status, "pending"));

  const pendingReview = await db.select({
    id: prompts.id,
    title: prompts.title,
    category: prompts.category,
    priceCents: prompts.priceCents,
    creatorId: prompts.creatorId,
    createdAt: prompts.createdAt,
    creatorName: user.name,
  })
    .from(prompts)
    .leftJoin(user, eq(prompts.creatorId, user.id))
    .where(eq(prompts.status, "pending"))
    .orderBy(desc(prompts.createdAt))
    .limit(20);

  const recentUsers = await db.select({
    id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt,
  })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(10);

  const pendingCreatorApps = await db
    .select({
      id: creatorApplications.id,
      userId: creatorApplications.userId,
      displayName: creatorApplications.displayName,
      username: creatorApplications.username,
      headline: creatorApplications.headline,
      bio: creatorApplications.bio,
      website: creatorApplications.website,
      portfolio: creatorApplications.portfolio,
      twitterHandle: creatorApplications.twitterHandle,
      githubHandle: creatorApplications.githubHandle,
      specialties: creatorApplications.specialties,
      experienceLevel: creatorApplications.experienceLevel,
      payoutEmail: creatorApplications.payoutEmail,
      status: creatorApplications.status,
      createdAt: creatorApplications.createdAt,
      userName: user.name,
      userEmail: user.email,
    })
    .from(creatorApplications)
    .leftJoin(user, eq(creatorApplications.userId, user.id))
    .where(eq(creatorApplications.status, "pending"))
    .orderBy(desc(creatorApplications.createdAt))
    .limit(20);

  return {
    totalUsers: totalUsers.count,
    totalPrompts: totalPrompts.count,
    pendingPrompts: pendingPrompts.count,
    totalRevenueCents: totalRevenue.sum,
    pendingAppCount: pendingApps.count,
    pendingReview,
    recentUsers,
    pendingCreatorApps,
  };
}

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") redirect("/");

  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-6 bg-red-500 rounded-full" />
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers.toString() },
            { label: "Published Prompts", value: stats.totalPrompts.toString() },
            { label: "Prompts Pending", value: stats.pendingPrompts.toString(), alert: stats.pendingPrompts > 0 },
            { label: "Creator Apps", value: stats.pendingAppCount.toString(), alert: stats.pendingAppCount > 0, violet: true },
            { label: "Gross Revenue", value: formatPrice(stats.totalRevenueCents) },
          ].map((s) => (
            <div key={s.label} className={`bg-zinc-900 border rounded-xl p-5 ${s.alert && s.violet ? "border-violet-500/30" : s.alert ? "border-amber-500/30" : "border-zinc-800"}`}>
              <p className="text-sm text-zinc-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.alert && s.violet ? "text-violet-400" : s.alert ? "text-amber-400" : "text-white"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Creator Applications */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">Creator Applications</h2>
              {stats.pendingAppCount > 0 && (
                <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full">
                  {stats.pendingAppCount} pending
                </span>
              )}
            </div>
            {stats.pendingCreatorApps.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-500 text-sm">No pending applications ✓</div>
            ) : (
              <div className="divide-y divide-zinc-800 max-h-[480px] overflow-y-auto">
                {stats.pendingCreatorApps.map((app) => (
                  <div key={app.id} className="px-5 py-4">
                    <div className="flex items-start gap-3 mb-1">
                      <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                        {app.displayName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{app.displayName}</p>
                        {app.username && <p className="text-xs text-violet-400">@{app.username}</p>}
                        <p className="text-xs text-zinc-500">{app.userEmail} · {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {app.headline && <p className="text-xs text-zinc-400 mb-1">{app.headline}</p>}
                    {app.bio && <p className="text-xs text-zinc-600 line-clamp-2 mb-1">{app.bio}</p>}
                    <div className="flex flex-wrap gap-1 mb-1">
                      <span className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-400 capitalize">
                        {app.experienceLevel}
                      </span>
                      {app.specialties?.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-400">{s}</span>
                      ))}
                    </div>
                    <div className="flex gap-3 text-xs text-zinc-600">
                      {app.website && <a href={app.website} target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">🌐 Website</a>}
                      {app.portfolio && <a href={app.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">📁 Portfolio</a>}
                      {app.githubHandle && <a href={`https://github.com/${app.githubHandle}`} target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">GitHub</a>}
                      {app.twitterHandle && <a href={`https://x.com/${app.twitterHandle}`} target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">X/Twitter</a>}
                    </div>
                    <CreatorApplicationActions applicationId={app.id} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Prompts */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-white">Prompts Pending Review</h2>
              {stats.pendingPrompts > 0 && (
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {stats.pendingPrompts} waiting
                </span>
              )}
            </div>
            {stats.pendingReview.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-500 text-sm">All caught up! ✓</div>
            ) : (
              <div className="divide-y divide-zinc-800 max-h-[480px] overflow-y-auto">
                {stats.pendingReview.map((p) => (
                  <div key={p.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{p.title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          by {p.creatorName} · {p.category} · {formatPrice(p.priceCents)} · {new Date(p.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <AdminActions promptId={p.id} promptTitle={p.title} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Recent Users</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{u.name}</p>
                  <p className="text-xs text-zinc-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "creator" ? "bg-violet-500/10 text-violet-400" : u.role === "admin" ? "bg-red-500/10 text-red-400" : "bg-zinc-800 text-zinc-500"}`}>
                    {u.role}
                  </span>
                  <span className="text-xs text-zinc-600">{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
