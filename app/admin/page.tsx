import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { prompts, user, purchases, creatorProfiles } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { AdminActions } from "@/components/admin/admin-actions";

async function getAdminStats() {
  const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(user);
  const [totalPrompts] = await db.select({ count: sql<number>`count(*)::int` }).from(prompts).where(eq(prompts.status, "published"));
  const [pendingPrompts] = await db.select({ count: sql<number>`count(*)::int` }).from(prompts).where(eq(prompts.status, "pending"));
  const [totalRevenue] = await db.select({ sum: sql<number>`coalesce(sum(amount_cents), 0)::int` }).from(purchases);

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

  const recentUsers = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt })
    .from(user)
    .orderBy(desc(user.createdAt))
    .limit(10);

  return { totalUsers: totalUsers.count, totalPrompts: totalPrompts.count, pendingPrompts: pendingPrompts.count, totalRevenueCents: totalRevenue.sum, pendingReview, recentUsers };
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Users", value: stats.totalUsers.toString() },
            { label: "Published Prompts", value: stats.totalPrompts.toString() },
            { label: "Pending Review", value: stats.pendingPrompts.toString(), alert: stats.pendingPrompts > 0 },
            { label: "Gross Revenue", value: formatPrice(stats.totalRevenueCents) },
          ].map((s) => (
            <div key={s.label} className={`bg-zinc-900 border rounded-xl p-5 ${s.alert ? "border-amber-500/30" : "border-zinc-800"}`}>
              <p className="text-sm text-zinc-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.alert ? "text-amber-400" : "text-white"}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
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
              <div className="divide-y divide-zinc-800">
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
    </div>
  );
}
