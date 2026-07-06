"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

export function NewCampaignForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const res = await fetch("/api/publisher/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      setTimeout(() => router.push("/publisher/campaigns"), 800);
    }
  }

  return (
    <form onSubmit={submit} className="bg-zinc-900 border border-violet-500/30 rounded-xl p-5 space-y-4">
      <h2 className="text-white font-semibold">New Campaign</h2>
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AI Agents Week"
          required
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What is this campaign about?"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || done}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : done ? <CheckCircle className="w-3.5 h-3.5" /> : null}
          {done ? "Created!" : "Create Campaign"}
        </button>
        <a href="/publisher/campaigns" className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</a>
      </div>
    </form>
  );
}
