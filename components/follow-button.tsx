"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";

export function FollowButton({ creatorId, initialFollowing }: { creatorId: string; initialFollowing: boolean }) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session) { window.location.href = "/login"; return; }
    setLoading(true);
    try {
      const res = await fetch("/api/follows", {
        method: following ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId }),
      });
      if (res.ok) setFollowing(!following);
    } finally { setLoading(false); }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-sm font-medium px-5 py-2 rounded-lg transition-colors ${
        following ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700" : "bg-violet-600 hover:bg-violet-500 text-white"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
