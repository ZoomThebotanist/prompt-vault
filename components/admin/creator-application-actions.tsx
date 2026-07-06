"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function CreatorApplicationActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  async function act(action: "approve" | "reject") {
    setLoading(action);
    try {
      await fetch(`/api/admin/creators/${applicationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason || undefined }),
      });
      router.refresh();
    } finally {
      setLoading(null);
      setRejecting(false);
    }
  }

  if (rejecting) {
    return (
      <div className="mt-2 space-y-2">
        <input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Rejection reason (optional)"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-red-500 transition-colors"
        />
        <div className="flex gap-2">
          <button
            onClick={() => act("reject")}
            disabled={!!loading}
            className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
            Confirm Reject
          </button>
          <button
            onClick={() => { setRejecting(false); setReason(""); }}
            className="text-xs text-zinc-500 hover:text-zinc-300 px-2"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      <button
        onClick={() => act("approve")}
        disabled={!!loading}
        className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        Approve
      </button>
      <button
        onClick={() => setRejecting(true)}
        disabled={!!loading}
        className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <XCircle className="w-3 h-3" />
        Reject
      </button>
    </div>
  );
}
