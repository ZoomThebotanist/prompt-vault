"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";

export function WishlistButton({ promptId }: { promptId: string }) {
  const { data: session } = useSession();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wishlists", {
        method: wishlisted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId }),
      });
      if (res.ok) setWishlisted(!wishlisted);
    } finally { setLoading(false); }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center justify-center gap-2 text-sm flex-1 rounded-lg py-2 px-3 transition-colors ${
        wishlisted ? "bg-violet-600/20 border border-violet-500/30 text-violet-300" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {wishlisted ? "♥ Saved" : "♡ Save"}
    </button>
  );
}
