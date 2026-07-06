"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlatformIcon } from "./platform-icon";
import type { PlatformSlug } from "@/lib/publisher/types";
import { PLATFORM_META } from "@/lib/publisher/types";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

const PLATFORMS: PlatformSlug[] = ["x", "reddit", "linkedin", "instagram", "tiktok", "bluesky"];

export function ManualTokenForm() {
  const router = useRouter();
  const [platform, setPlatform] = useState<PlatformSlug>("x");
  const [handle, setHandle] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!handle.trim() || !accessToken.trim()) {
      setError("Handle and access token are required.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/publisher/accounts/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform,
        accountHandle: handle.trim().replace(/^@/, ""),
        accessToken: accessToken.trim(),
        refreshToken: refreshToken.trim() || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? "Failed to save account");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push(`/publisher/accounts?connected=${platform}`), 1000);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
      <h2 className="text-white font-semibold">Add Account via Token</h2>

      {/* Platform selector */}
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-2 block">Platform</label>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                platform === p
                  ? "border-violet-500 bg-violet-500/10 text-white"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              <PlatformIcon platform={p} size="sm" />
              {PLATFORM_META[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Handle */}
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Account Handle</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">@</span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="yourhandle"
            required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg pl-7 pr-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Access Token */}
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Access Token</label>
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            placeholder="Paste your bearer / access token here"
            required
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 pr-10 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
          />
          <button
            type="button"
            onClick={() => setShowToken((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-zinc-600 text-xs mt-1">This token is stored in your database. Use OAuth connect above for better security.</p>
      </div>

      {/* Refresh Token (optional) */}
      <div>
        <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Refresh Token <span className="text-zinc-700">(optional)</span></label>
        <input
          type="password"
          value={refreshToken}
          onChange={(e) => setRefreshToken(e.target.value)}
          placeholder="If you have one — used to auto-refresh expired tokens"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2.5 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
        />
      </div>

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
          Account saved! Redirecting...
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {success ? "Saved!" : "Save Account"}
      </button>
    </form>
  );
}
