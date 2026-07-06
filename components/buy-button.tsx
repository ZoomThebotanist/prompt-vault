"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

interface BuyButtonProps {
  productId: string;
  productSlug: string;
  isPrompt?: boolean;
  pricingType?: string;
  minPriceCents?: number | null;
  priceCents?: number;
}

export function BuyButton({
  productId,
  productSlug,
  isPrompt = false,
  pricingType = "paid",
  minPriceCents,
  priceCents = 0,
}: BuyButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [pwywAmount, setPwywAmount] = useState(
    pricingType === "pwyw"
      ? ((minPriceCents ?? priceCents ?? 100) / 100).toFixed(2)
      : ""
  );
  const [error, setError] = useState("");

  if (!session) {
    return (
      <Link
        href="/login"
        className="block w-full text-center bg-white text-black hover:bg-zinc-200 font-semibold py-3 rounded-xl transition-colors text-base"
      >
        Sign in to Buy →
      </Link>
    );
  }

  async function handleBuy() {
    setError("");
    let customAmountCents: number | undefined;

    if (pricingType === "pwyw") {
      const parsed = parseFloat(pwywAmount);
      if (isNaN(parsed) || parsed < 0) {
        setError("Enter a valid amount.");
        return;
      }
      const min = (minPriceCents ?? 0) / 100;
      if (parsed < min) {
        setError(`Minimum is $${min.toFixed(2)}.`);
        return;
      }
      customAmountCents = Math.round(parsed * 100);
      // Free PWYW — use claim endpoint instead
      if (customAmountCents === 0) {
        setLoading(true);
        try {
          const res = await fetch(`/api/prompts/${productId}/claim`, { method: "POST" });
          const data = await res.json();
          if (!res.ok) { setError(data.error ?? "Something went wrong."); }
          else { window.location.href = "/purchases"; }
        } catch { setError("Something went wrong."); }
        finally { setLoading(false); }
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, productSlug, isPrompt, customAmountCents }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const minDollars = minPriceCents ? minPriceCents / 100 : 0;

  return (
    <div className="space-y-2">
      {pricingType === "pwyw" && (
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5">
            Name your price{minDollars > 0 ? ` (min $${minDollars.toFixed(2)})` : ""}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">$</span>
            <input
              type="number"
              min={minDollars}
              step="0.01"
              value={pwywAmount}
              onChange={e => setPwywAmount(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-3 rounded-xl transition-colors text-base disabled:opacity-60"
      >
        {loading
          ? "Redirecting..."
          : pricingType === "pwyw"
          ? `Pay $${parseFloat(pwywAmount || "0").toFixed(2)} →`
          : "Buy Now →"}
      </button>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}
    </div>
  );
}
