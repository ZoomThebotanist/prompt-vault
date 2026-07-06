import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { prompts, purchases } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

async function getPurchaseDetails(sessionId: string, userId?: string) {
  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = stripeSession.metadata ?? {};

    if (metadata.promptId) {
      const [prompt] = await db
        .select({ id: prompts.id, title: prompts.title, slug: prompts.slug, category: prompts.category })
        .from(prompts)
        .where(eq(prompts.id, metadata.promptId))
        .limit(1);

      // Find the purchase record so we can link to download
      let purchaseId: string | null = null;
      if (userId && prompt) {
        const [purchase] = await db
          .select({ id: purchases.id })
          .from(purchases)
          .where(and(eq(purchases.promptId, prompt.id), eq(purchases.buyerId, userId)))
          .limit(1);
        purchaseId = purchase?.id ?? null;
      }

      return { type: "prompt" as const, prompt, purchaseId, email: stripeSession.customer_email };
    }

    return { type: "product" as const, prompt: null, purchaseId: null, email: stripeSession.customer_email };
  } catch {
    return null;
  }
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });

  const details = session_id ? await getPurchaseDetails(session_id, session?.user?.id) : null;
  const promptTitle = details?.prompt?.title;
  const promptSlug = details?.prompt?.slug;
  const purchaseId = details?.purchaseId;
  const email = details?.email ?? session?.user?.email;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Checkmark */}
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-9 h-9 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Purchase complete!</h1>
          {promptTitle ? (
            <p className="text-zinc-400">
              You now own <span className="text-white font-medium">{promptTitle}</span>
            </p>
          ) : (
            <p className="text-zinc-400">Your purchase was successful.</p>
          )}
        </div>

        {/* Email notice */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-lg">📧</span>
            <p className="text-sm font-medium text-white">Prompt delivered to your email</p>
          </div>
          <p className="text-sm text-zinc-400">
            The full prompt has been sent to{" "}
            <span className="text-zinc-200">{email ?? "your email address"}</span>.
            Check your inbox (and spam folder just in case).
          </p>
          <ol className="text-sm text-zinc-500 space-y-1.5 mt-3 list-decimal list-inside">
            <li>Open the email from <span className="text-zinc-400">delivery@promptvault.dev</span></li>
            <li>Copy the full prompt</li>
            <li>Paste into Claude, ChatGPT, or your AI tool</li>
            <li>Replace any <span className="font-mono text-zinc-300 text-xs">[VARIABLE]</span> placeholders</li>
          </ol>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          {purchaseId && (
            <a
              href={`/api/purchases/${purchaseId}/download`}
              className="block w-full py-3 bg-white text-black text-base font-semibold rounded-xl hover:bg-zinc-200 transition-colors text-center"
            >
              Download Prompt File →
            </a>
          )}

          <Link
            href="/purchases"
            className={`block w-full py-3 text-base font-semibold rounded-xl text-center transition-colors ${
              purchaseId
                ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                : "bg-white text-black hover:bg-zinc-200"
            }`}
          >
            View My Purchases
          </Link>

          {promptSlug && (
            <Link href={`/p/${promptSlug}`} className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors">
              ← Back to prompt listing
            </Link>
          )}
        </div>

        <div className="pt-2">
          <Link href="/browse" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
            Browse more prompts →
          </Link>
        </div>

        <p className="text-xs text-zinc-600">
          Questions?{" "}
          <a href="mailto:support@promptvault.dev" className="text-zinc-500 hover:text-zinc-400 transition-colors">
            support@promptvault.dev
          </a>
        </p>
      </div>
    </div>
  );
}
