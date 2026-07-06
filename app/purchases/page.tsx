import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { purchases, prompts } from "@/db/schema";
import { eq, desc, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/purchases");

  const rows = await db
    .select({
      id: purchases.id,
      promptId: purchases.promptId,
      amountCents: purchases.amountCents,
      deliveredAt: purchases.deliveredAt,
      refundedAt: purchases.refundedAt,
      createdAt: purchases.createdAt,
      promptTitle: prompts.title,
      promptSlug: prompts.slug,
      promptDescription: prompts.description,
      promptCoverImageUrl: prompts.coverImageUrl,
      promptCategory: prompts.category,
    })
    .from(purchases)
    .leftJoin(prompts, eq(purchases.promptId, prompts.id))
    .where(eq(purchases.buyerId, session.user.id))
    .orderBy(desc(purchases.createdAt));

  // Separate active from refunded
  const active = rows.filter(r => !r.refundedAt && r.promptId);
  const refunded = rows.filter(r => r.refundedAt);
  const legacyPurchases = rows.filter(r => !r.promptId);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Purchases</h1>
          <p className="text-zinc-400 text-sm mt-1">{active.length} prompt{active.length !== 1 ? "s" : ""} purchased</p>
        </div>

        {rows.length === 0 && (
          <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-zinc-500 text-lg mb-2">No purchases yet</p>
            <p className="text-zinc-600 text-sm mb-6">Browse the marketplace to find your first prompt.</p>
            <Link href="/browse" className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Browse Prompts
            </Link>
          </div>
        )}

        {active.length > 0 && (
          <div className="space-y-3 mb-10">
            {active.map((p) => (
              <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-5 flex items-start gap-4">
                  {p.promptCoverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.promptCoverImageUrl} alt={p.promptTitle ?? ""} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-900/40 to-zinc-800 rounded-lg shrink-0 flex items-center justify-center">
                      <span className="text-xl opacity-30">✦</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-white text-sm leading-tight">{p.promptTitle ?? "Prompt"}</h3>
                        {p.promptDescription && (
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{p.promptDescription}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {p.promptCategory && (
                            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full capitalize">
                              {p.promptCategory.replace(/-/g, " ")}
                            </span>
                          )}
                          <span className="text-xs text-zinc-600">
                            Purchased {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          {p.amountCents > 0 && (
                            <span className="text-xs text-zinc-500">{formatPrice(p.amountCents)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {p.deliveredAt ? (
                          <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Delivered</span>
                        ) : (
                          <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Processing</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Access prompt footer */}
                <div className="border-t border-zinc-800 px-5 py-3 flex items-center justify-between bg-zinc-950/50">
                  <p className="text-xs text-zinc-500">
                    {p.deliveredAt ? "Prompt delivered to your email" : "Delivery in progress"}
                  </p>
                  <div className="flex items-center gap-2">
                    {p.promptSlug && (
                      <Link
                        href={`/p/${p.promptSlug}`}
                        className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        View listing →
                      </Link>
                    )}
                    <Link
                      href={`/api/purchases/${p.id}/download`}
                      className="text-xs bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
                    >
                      Download
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {legacyPurchases.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wide">Legacy Purchases</h2>
            <div className="space-y-2">
              {legacyPurchases.map(p => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Order #{p.id.slice(0, 8)}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {new Date(p.createdAt).toLocaleDateString()} · {formatPrice(p.amountCents)}
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500">Email delivery</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {refunded.length > 0 && (
          <details className="mt-6">
            <summary className="text-sm text-zinc-500 cursor-pointer hover:text-zinc-400 transition-colors">
              {refunded.length} refunded purchase{refunded.length !== 1 ? "s" : ""}
            </summary>
            <div className="mt-3 space-y-2">
              {refunded.map(p => (
                <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between opacity-50">
                  <div>
                    <p className="text-sm text-zinc-400 line-through">{p.promptTitle ?? `Order #${p.id.slice(0, 8)}`}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">Refunded {new Date(p.refundedAt!).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs text-red-400">Refunded</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
