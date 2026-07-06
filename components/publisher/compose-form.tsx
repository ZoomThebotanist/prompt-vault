"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PublisherAccount, PublisherCampaign } from "@/db/schema";
import type { PlatformSlug } from "@/lib/publisher/types";
import { PLATFORM_META } from "@/lib/publisher/types";
import { PlatformIcon } from "./platform-icon";
import { Send, Clock, FileText, Link2, Hash, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const SUPPORTED: PlatformSlug[] = ["x", "reddit", "linkedin", "instagram", "tiktok", "bluesky"];
const MAX_CHARS: Record<PlatformSlug, number> = {
  x: 280, reddit: 40000, linkedin: 3000, instagram: 2200, facebook: 63206,
  tiktok: 2200, youtube: 5000, bluesky: 300, threads: 500, pinterest: 500,
};

interface PlatformOverride {
  text: string;
}

type ScheduleMode = "now" | "schedule" | "draft";

export function ComposeForm({ accounts, campaigns }: { accounts: PublisherAccount[]; campaigns: PublisherCampaign[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Content
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [hashtags, setHashtagInput] = useState("");
  const [mediaUrls, setMediaUrls] = useState("");

  // Platform selection
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  // Platform overrides (per-platform custom text)
  const [activeTab, setActiveTab] = useState<"main" | PlatformSlug>("main");
  const [overrides, setOverrides] = useState<Partial<Record<PlatformSlug, PlatformOverride>>>({});

  // Schedule
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [campaignId, setCampaignId] = useState("");
  const [priority, setPriority] = useState("5");

  const selectedAccounts = accounts.filter((a) => selectedAccountIds.includes(a.id));
  const selectedPlatforms = [...new Set(selectedAccounts.map((a) => a.platform as PlatformSlug))];

  function toggleAccount(id: string) {
    setSelectedAccountIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  function getTextForPlatform(platform: PlatformSlug): string {
    return overrides[platform]?.text ?? description;
  }

  function charCount(platform: PlatformSlug) {
    const text = getTextForPlatform(platform);
    const hashtag = hashtags ? ` ${hashtags}` : "";
    const lnk = link ? ` ${link}` : "";
    return text.length + hashtag.length + lnk.length;
  }

  async function handleSubmit() {
    if (!description && !title) { setError("Add some content before posting."); return; }
    if (selectedAccountIds.length === 0 && scheduleMode !== "draft") { setError("Select at least one account."); return; }

    setLoading(true);
    setError("");

    const res = await fetch("/api/publisher/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        link,
        hashtags: hashtags.split(/[\s,]+/).filter(Boolean).map((h) => h.replace(/^#/, "")),
        mediaUrls: mediaUrls.split("\n").filter(Boolean),
        accountIds: selectedAccountIds,
        platformOverrides: overrides,
        scheduleMode,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        timezone,
        campaignId: campaignId || null,
        priority: parseInt(priority),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/publisher/queue"), 1200);
  }

  const hasAccounts = accounts.length > 0;

  return (
    <div className="space-y-6">
      {/* Account selector */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Post to</h2>
        {!hasAccounts ? (
          <div className="text-center py-6 border border-dashed border-zinc-700 rounded-lg">
            <p className="text-zinc-500 text-sm">No accounts connected yet.</p>
            <a href="/publisher/accounts" className="text-violet-400 text-sm hover:text-violet-300 mt-1 inline-block">Connect an account →</a>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {accounts.map((account) => {
              const selected = selectedAccountIds.includes(account.id);
              const meta = PLATFORM_META[account.platform as PlatformSlug];
              return (
                <button
                  key={account.id}
                  onClick={() => toggleAccount(account.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    selected
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  <PlatformIcon platform={account.platform as PlatformSlug} size="sm" />
                  <span>@{account.accountHandle}</span>
                  {selected && <CheckCircle className="w-3.5 h-3.5 text-violet-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content editor */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {/* Platform tabs */}
        <div className="flex items-center border-b border-zinc-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("main")}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
              activeTab === "main" ? "border-violet-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Main Content
          </button>
          {selectedPlatforms.map((p) => {
            const count = charCount(p);
            const max = MAX_CHARS[p];
            const over = count > max;
            return (
              <button
                key={p}
                onClick={() => setActiveTab(p)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors ${
                  activeTab === p ? "border-violet-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <PlatformIcon platform={p} size="sm" />
                <span>{PLATFORM_META[p].label}</span>
                {over && <AlertCircle className="w-3 h-3 text-red-400" />}
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-4">
          {activeTab === "main" ? (
            <>
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title or headline..."
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Content</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you want to say? This will be used for all platforms (customize per-platform in the tabs above)."
                  rows={6}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                  <PlatformIcon platform={activeTab} size="sm" />
                  {PLATFORM_META[activeTab].label} — Custom Text
                </label>
                <span className={`text-xs ${charCount(activeTab) > MAX_CHARS[activeTab] ? "text-red-400" : "text-zinc-600"}`}>
                  {charCount(activeTab)}/{MAX_CHARS[activeTab]}
                </span>
              </div>
              <textarea
                value={overrides[activeTab]?.text ?? description}
                onChange={(e) => setOverrides((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], text: e.target.value } }))}
                placeholder={`Customize the text for ${PLATFORM_META[activeTab].label}...`}
                rows={activeTab === "reddit" ? 10 : 6}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
              {overrides[activeTab]?.text && (
                <button
                  onClick={() => setOverrides((prev) => { const n = { ...prev }; delete n[activeTab as PlatformSlug]; return n; })}
                  className="text-xs text-zinc-500 hover:text-zinc-300 mt-1.5"
                >
                  ↩ Reset to main content
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtagInput(e.target.value)}
                placeholder="#AI #prompts #productivity"
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> Link
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://promptvault.com/..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Media URLs (one per line)</label>
            <textarea
              value={mediaUrls}
              onChange={(e) => setMediaUrls(e.target.value)}
              placeholder="https://..."
              rows={2}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-500" /> Publishing
        </h2>
        <div className="flex gap-2 mb-4">
          {(["draft", "now", "schedule"] as ScheduleMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setScheduleMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                scheduleMode === mode
                  ? "border-violet-500 bg-violet-500/10 text-violet-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {mode === "draft" ? "Save Draft" : mode === "now" ? "Publish Now" : "Schedule"}
            </button>
          ))}
        </div>

        {scheduleMode === "schedule" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Timezone</label>
              <input
                type="text"
                value={timezone}
                readOnly
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Campaign + Priority */}
      {campaigns.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Campaign (optional)</label>
              <select
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              >
                <option value="">No campaign</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Priority (1=highest)</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              >
                <option value="1">1 — Urgent</option>
                <option value="3">3 — High</option>
                <option value="5">5 — Normal</option>
                <option value="8">8 — Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error / Success */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Post created! Redirecting to queue...
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading || success}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {scheduleMode === "draft" ? "Save Draft" : scheduleMode === "now" ? "Publish Now" : "Schedule Post"}
      </button>
    </div>
  );
}
