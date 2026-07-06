import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { prompts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { formatPrice } from "@/lib/products";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardPromptsPage({ searchParams }: { searchParams: Promise<{ published?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/dashboard/prompts");
  if (session.user.role !== "creator" && session.user.role !== "admin") redirect("/onboard");

  const { published } = await searchParams;

  const allPrompts = await db
    .select()
    .from(prompts)
    .where(eq(prompts.creatorId, session.user.id))
    .orderBy(desc(prompts.createdAt));

  const statusGroups = {
    published: allPrompts.filter(p => p.status === "published"),
    pending: allPrompts.filter(p => p.status === "pending"),
    draft: allPrompts.filter(p => p.status === "draft"),
    rejected: allPrompts.filter(p => p.status === "rejected"),
    archived: allPrompts.filter(p => p.status === "archived"),
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
          </div>
          <Link href="/upload" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + New Prompt
          </Link>
        </div>

        <DashboardNav />

        {published && (
          <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-sm text-emerald-400">
            ✓ Prompt submitted for review. We&apos;ll notify you when it&apos;s approved (usually within 24–48 hours).
          </div>
        )}

        <div className="mt-6 space-y-6">
          {Object.entries(statusGroups).map(([status, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={status}>
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${status === "published" ? "bg-emerald-400" : status === "pending" ? "bg-amber-400" : status === "rejected" ? "bg-red-400" : "bg-zinc-600"}`} />
                  {status} ({items.length})
                </h3>
                <div className="space-y-2">
                  {items.map((p) => (
                    <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-start justify-between gap-4 hover:border-zinc-700 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-white truncate">{p.title}</p>
                          {status === "rejected" && p.rejectionReason && (
                            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full shrink-0">
                              Rejected
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 truncate">{p.description}</p>
                        {p.rejectionReason && (
                          <p className="text-xs text-red-400 mt-1.5">Reason: {p.rejectionReason}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-600">
                          <span>{p.salesCount} sales</span>
                          <span>{p.viewCount} views</span>
                          {p.reviewCount > 0 && <span>⭐ {Number(p.avgRating ?? 0).toFixed(1)} ({p.reviewCount})</span>}
                          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium text-white">{formatPrice(p.priceCents)}</span>
                        <div className="flex items-center gap-2">
                          {p.status === "published" && (
                            <Link href={`/p/${p.slug}`} className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors">
                              View
                            </Link>
                          )}
                          <Link href={`/edit/${p.id}`} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {allPrompts.length === 0 && (
            <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
              <p className="text-4xl mb-4">📝</p>
              <p className="text-white font-medium mb-1">No prompts yet</p>
              <p className="text-zinc-500 text-sm mb-4">Upload your first prompt to start earning.</p>
              <Link href="/upload" className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors inline-block">
                Upload a Prompt
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
