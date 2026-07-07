"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

  async function promote() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/setup", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: "Request failed — are you signed in?" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-4xl mb-5">🔐</div>
        <h1 className="text-xl font-bold text-white mb-2">Admin Bootstrap</h1>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          This promotes the currently signed-in account to admin. Only works once — if an admin already exists, this is blocked.
        </p>

        {result ? (
          <div className={`rounded-xl p-4 text-sm mb-5 ${result.success ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {result.message ?? result.error}
          </div>
        ) : null}

        {result?.success ? (
          <Link
            href="/admin"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Go to Admin Dashboard →
          </Link>
        ) : (
          <button
            onClick={promote}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Promoting...
              </span>
            ) : "Make Me Admin"}
          </button>
        )}

        <p className="mt-4 text-xs text-zinc-600">
          Make sure you&apos;re signed in first.{" "}
          <Link href="/login" className="text-zinc-500 hover:text-zinc-400 underline">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
