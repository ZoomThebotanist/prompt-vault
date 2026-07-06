"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/products";

export function RequestPayoutButton({ amount }: { amount: number }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function request() {
    setLoading(true);
    try {
      const res = await fetch("/api/creator/payout", { method: "POST" });
      if (res.ok) setDone(true);
    } finally { setLoading(false); }
  }

  if (done) {
    return <span className="text-sm text-emerald-400 font-medium">Payout requested ✓</span>;
  }

  return (
    <button
      onClick={request}
      disabled={loading}
      className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? "Requesting..." : `Request ${formatPrice(amount)}`}
    </button>
  );
}
