import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { purchases, prompts } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { formatPrice } from "@/lib/products";

export default async function CustomersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/customers");
  if (session.user.role !== "creator" && session.user.role !== "admin") redirect("/onboard");

  const salesData = await db
    .select({
      email: purchases.customerEmail,
      totalSpent: sql<number>`sum(amount_cents)::int`,
      totalEarned: sql<number>`sum(creator_earnings_cents)::int`,
      orderCount: sql<number>`count(*)::int`,
      lastPurchase: sql<string>`max(${purchases.createdAt})::text`,
    })
    .from(purchases)
    .where(eq(purchases.creatorId, session.user.id))
    .groupBy(purchases.customerEmail)
    .orderBy(desc(sql`sum(creator_earnings_cents)`))
    .limit(100);

  const recentOrders = await db
    .select({
      id: purchases.id,
      email: purchases.customerEmail,
      amountCents: purchases.amountCents,
      creatorEarningsCents: purchases.creatorEarningsCents,
      createdAt: purchases.createdAt,
      promptTitle: prompts.title,
    })
    .from(purchases)
    .leftJoin(prompts, eq(purchases.promptId, prompts.id))
    .where(eq(purchases.creatorId, session.user.id))
    .orderBy(desc(purchases.createdAt))
    .limit(50);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
        </div>
        <DashboardNav />

        <div className="mt-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-sm text-zinc-500">Total Customers</p>
              <p className="text-2xl font-bold text-white mt-1">{salesData.length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-sm text-zinc-500">Repeat Customers</p>
              <p className="text-2xl font-bold text-white mt-1">{salesData.filter(c => c.orderCount > 1).length}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-sm text-zinc-500">Total Orders</p>
              <p className="text-2xl font-bold text-white mt-1">{recentOrders.length}</p>
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white">Top Customers</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Ranked by lifetime spend</p>
            </div>
            {salesData.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-500 text-sm">No customers yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Customer</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Orders</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">You Earned</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Last Purchase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {salesData.map((c) => (
                      <tr key={c.email} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-5 py-3 text-zinc-300">{c.email}</td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-zinc-400">{c.orderCount}</span>
                          {c.orderCount > 1 && <span className="ml-2 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full">Repeat</span>}
                        </td>
                        <td className="px-5 py-3 text-right text-emerald-400 font-medium">{formatPrice(c.totalEarned)}</td>
                        <td className="px-5 py-3 text-right text-zinc-500 text-xs">
                          {new Date(c.lastPurchase).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white">Recent Orders</h2>
            </div>
            {recentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-500 text-sm">No orders yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Customer</th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Prompt</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Earned</th>
                      <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="px-5 py-3 text-zinc-300">{o.email}</td>
                        <td className="px-5 py-3 text-zinc-400 truncate max-w-xs">{o.promptTitle ?? "—"}</td>
                        <td className="px-5 py-3 text-right text-emerald-400 font-medium">{formatPrice(o.creatorEarningsCents)}</td>
                        <td className="px-5 py-3 text-right text-zinc-500 text-xs whitespace-nowrap">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
