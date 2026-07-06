import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PlatformIcon } from "@/components/publisher/platform-icon";
import type { PlatformSlug } from "@/lib/publisher/types";
import { PLATFORM_META } from "@/lib/publisher/types";
import { Plus, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { DisconnectAccount } from "@/components/publisher/disconnect-account";
import { OAuthConnectBanner } from "@/components/publisher/oauth-connect-banner";
import { RedditSubredditInput } from "@/components/publisher/reddit-subreddit-input";

const SUPPORTED_PLATFORMS: { slug: PlatformSlug; available: boolean; note?: string }[] = [
  { slug: "x",         available: true },
  { slug: "reddit",    available: true },
  { slug: "linkedin",  available: false, note: "Coming soon" },
  { slug: "instagram", available: false, note: "Coming soon" },
  { slug: "tiktok",    available: false, note: "Coming soon" },
  { slug: "bluesky",   available: false, note: "Coming soon" },
];

export default async function AccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { connected, error } = await searchParams;

  const accounts = await db
    .select()
    .from(publisherAccounts)
    .where(eq(publisherAccounts.userId, session.user.id));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Connected Accounts</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your social media platform connections</p>
      </div>

      {/* OAuth result banners */}
      <OAuthConnectBanner connected={connected} error={error} />

      {/* Connected accounts */}
      {accounts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Connected</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
            {accounts.map((account) => {
              const expired = account.tokenExpiresAt && new Date(account.tokenExpiresAt) < new Date();
              return (
                <div key={account.id} className="flex items-center gap-4 px-5 py-4">
                  {account.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={account.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <PlatformIcon platform={account.platform as PlatformSlug} size="md" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-medium">{account.accountName ?? `@${account.accountHandle}`}</p>
                      <PlatformIcon platform={account.platform as PlatformSlug} size="sm" />
                    </div>
                    <p className="text-zinc-500 text-sm">
                      @{account.accountHandle}
                      {account.tokenExpiresAt && (
                        <span className="ml-2 text-zinc-600">
                          · Token {expired ? "expired" : `expires ${new Date(account.tokenExpiresAt).toLocaleDateString()}`}
                        </span>
                      )}
                    </p>
                    {account.platform === "reddit" && (
                      <RedditSubredditInput
                        accountId={account.id}
                        currentSubreddit={
                          account.metadata
                            ? ((JSON.parse(account.metadata) as { subreddit?: string }).subreddit ?? "")
                            : ""
                        }
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {expired ? (
                      <a
                        href={`/api/publisher/oauth/connect/${account.platform}`}
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" /> Reconnect
                      </a>
                    ) : (
                      <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    )}
                    <DisconnectAccount accountId={account.id} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add platform */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Add Platform</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {SUPPORTED_PLATFORMS
            .filter((p) => !accounts.find((a) => a.platform === p.slug))
            .map(({ slug, available, note }) => {
              const meta = PLATFORM_META[slug];
              return (
                <div
                  key={slug}
                  className={`bg-zinc-900 border rounded-xl p-4 transition-colors ${
                    available ? "border-zinc-800 hover:border-zinc-600" : "border-zinc-800 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <PlatformIcon platform={slug} size="md" />
                    <div>
                      <p className="text-white font-medium text-sm">{meta.label}</p>
                      {note && <p className="text-zinc-500 text-xs">{note}</p>}
                    </div>
                  </div>
                  {available ? (
                    <a
                      href={`/api/publisher/oauth/connect/${slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Connect account
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-600">Available soon</p>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Manual token setup */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-sm font-semibold text-white">Manual Token Setup</h2>
          <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">Advanced</span>
        </div>
        <p className="text-zinc-500 text-sm mb-4">
          Use a developer bearer token directly — useful for testing or bot accounts that already have tokens.
        </p>
        <a
          href="/publisher/accounts/manual"
          className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add via token →
        </a>
      </div>
    </div>
  );
}
