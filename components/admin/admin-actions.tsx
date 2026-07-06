"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminActions({ promptId, promptTitle }: { promptId: string; promptTitle: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  async function approve() {
    setLoading("approve");
    try {
      await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, action: "approve" }),
      });
      router.refresh();
    } finally { setLoading(null); }
  }

  async function reject() {
    if (!rejectionReason.trim()) return;
    setLoading("reject");
    try {
      await fetch("/api/admin/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId, action: "reject", reason: rejectionReason }),
      });
      router.refresh();
    } finally { setLoading(null); setShowReject(false); }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={approve}
          disabled={loading === "approve"}
          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading === "approve" ? "Approving..." : "✓ Approve"}
        </button>
        <button
          onClick={() => setShowReject(!showReject)}
          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-colors"
        >
          Reject
        </button>
      </div>
      {showReject && (
        <div className="mt-2 flex gap-2">
          <input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Rejection reason..."
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-red-500"
          />
          <button onClick={reject} disabled={loading === "reject" || !rejectionReason.trim()} className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50">
            Send
          </button>
        </div>
      )}
    </div>
  );
}
