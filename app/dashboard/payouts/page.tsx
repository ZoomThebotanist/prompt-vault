import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { payouts, creatorProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { formatPrice } from "@/lib/products";
import { RequestPayoutButton } from "@/components/dashboard/request-payout-button";

export default async function PayoutsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/payouts");
  if (session.user.role !== "creator" && session.user.role !== "admin") redirect("/onboard");

  const [profile] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, session.user.id)).limit(1);

  const payoutHistory = await db
    .select()
    .from(payouts)
    .where(eq(payouts.creatorId, session.user.id))
    .orderBy(desc(payouts.createdAt))
    .limit(20);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
        </div>
        <DashboardNav />

        <div className="mt-6 space-y-6">
          {/* Balance */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-sm text-zinc-500 mb-1">Available for Payout</p>
              <p className="text-3xl font-bold text-emerald-400">{formatPrice(profile?.pendingPayoutCents ?? 0)}</p>
              <p className="text-xs text-zinc-600 mt-1">Ready to transfer</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-sm text-zinc-500 mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-white">{formatPrice(profile?.totalRevenueCents ?? 0)}</p>
              <p className="text-xs text-zinc-600 mt-1">Lifetime earnings</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-sm text-zinc-500 mb-1">Total Paid Out</p>
              <p className="text-3xl font-bold text-white">
                {formatPrice(payoutHistory.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amountCents, 0))}
              </p>
              <p className="text-xs text-zinc-600 mt-1">Successfully transferred</p>
            </div>
          </div>

          {/* Request payout */}
          {(profile?.pendingPayoutCents ?? 0) >= 1000 && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Request Payout</p>
                <p className="text-sm text-zinc-400 mt-0.5">Transfer {formatPrice(profile?.pendingPayoutCents ?? 0)} to your payout account.</p>
              </div>
              <RequestPayoutButton amount={profile?.pendingPayoutCents ?? 0} />
            </div>
          )}

          {(profile?.pendingPayoutCents ?? 0) < 1000 && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <p className="text-sm text-zinc-400">
                Minimum payout threshold: <strong className="text-white">$10.00</strong>.{" "}
                You have {formatPrice(profile?.pendingPayoutCents ?? 0)} available.{" "}
                {1000 - (profile?.pendingPayoutCents ?? 0) > 0 && (
                  <span>Earn {formatPrice(1000 - (profile?.pendingPayoutCents ?? 0))} more to request a payout.</span>
                )}
              </p>
            </div>
          )}

          {/* Payout info */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="font-medium text-white mb-3">Payout Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Payout email</span>
                <span className="text-zinc-300">{profile?.payoutEmail ?? "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Revenue split</span>
                <span className="text-zinc-300">80% creator / 20% platform</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Minimum payout</span>
                <span className="text-zinc-300">$10.00</span>
              </div>
            </div>
          </div>

          {/* Payout history */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white">Payout History</h2>
            </div>
            {payoutHistory.length === 0 ? (
              <div className="px-5 py-8 text-center text-zinc-500 text-sm">No payouts yet.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {payoutHistory.map((p) => (
                  <div key={p.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{formatPrice(p.amountCents)}</p>
                      <p className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                      p.status === "processing" ? "bg-amber-500/10 text-amber-400" :
                      p.status === "failed" ? "bg-red-500/10 text-red-400" :
                      "bg-zinc-700 text-zinc-400"
                    }`}>
                      {p.status}
                    </span>
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
