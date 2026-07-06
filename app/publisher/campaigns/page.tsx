import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherCampaigns, publisherPosts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { FolderOpen, Plus, FolderPlus } from "lucide-react";
import { NewCampaignForm } from "@/components/publisher/new-campaign-form";

async function getCampaigns(userId: string) {
  const campaigns = await db
    .select()
    .from(publisherCampaigns)
    .where(eq(publisherCampaigns.userId, userId));

  const campaignsWithCounts = await Promise.all(
    campaigns.map(async (c) => {
      const [counts] = await db.select({
        total: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where status = 'published')::int`,
      }).from(publisherPosts).where(eq(publisherPosts.campaignId, c.id));
      return { ...c, ...counts };
    })
  );

  return campaignsWithCounts;
}

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<{ new?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const { new: showNew } = await searchParams;
  const campaigns = await getCampaigns(session.user.id);

  const statusColors: Record<string, string> = {
    active:    "bg-emerald-500/10 text-emerald-400",
    paused:    "bg-amber-500/10 text-amber-400",
    completed: "bg-zinc-700/50 text-zinc-400",
    archived:  "bg-zinc-700/50 text-zinc-500",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-zinc-500 text-sm mt-1">Group and track posts by campaign</p>
        </div>
        <Link
          href="/publisher/campaigns?new=1"
          className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      {showNew && (
        <div className="mb-6">
          <NewCampaignForm />
        </div>
      )}

      {campaigns.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl py-16 text-center">
          <FolderPlus className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">No campaigns yet</p>
          <p className="text-zinc-600 text-sm mt-1">Group your posts into campaigns for easier tracking</p>
          <Link href="/publisher/campaigns?new=1" className="inline-flex items-center gap-2 mt-4 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Create Campaign
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-zinc-500" />
                  <h3 className="text-white font-semibold">{campaign.name}</h3>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[campaign.status] ?? "bg-zinc-700/50 text-zinc-400"}`}>
                  {campaign.status}
                </span>
              </div>
              {campaign.description && (
                <p className="text-zinc-500 text-sm mb-3 line-clamp-2">{campaign.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
                <span><span className="text-white font-medium">{campaign.total}</span> posts</span>
                <span><span className="text-emerald-400 font-medium">{campaign.published}</span> published</span>
              </div>
              {(campaign.startDate || campaign.endDate) && (
                <p className="text-xs text-zinc-600">
                  {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "?"} →{" "}
                  {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "Ongoing"}
                </p>
              )}
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/publisher/queue?campaign=${campaign.id}`}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  View posts →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
