"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostStatus } from "@/lib/publisher/types";
import { Zap, RotateCcw, X, ExternalLink } from "lucide-react";

export function QueueActions({ postId, status }: { postId: string; status: PostStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "publish" | "cancel" | "retry") {
    setLoading(true);
    try {
      await fetch(`/api/publisher/posts/${postId}/${action}`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      {(status === "draft" || status === "waiting") && (
        <button
          onClick={() => handleAction("publish")}
          disabled={loading}
          title="Publish Now"
          className="p-1.5 rounded-md text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5" />
        </button>
      )}
      {status === "failed" && (
        <button
          onClick={() => handleAction("retry")}
          disabled={loading}
          title="Retry"
          className="p-1.5 rounded-md text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
      {(status === "waiting" || status === "queued" || status === "draft") && (
        <button
          onClick={() => handleAction("cancel")}
          disabled={loading}
          title="Cancel"
          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
