"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BuyButtonProps {
  productId: string;
  productSlug: string;
}

export function BuyButton({ productId, productSlug }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, productSlug }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleBuy}
      disabled={loading}
      className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-5 text-base"
    >
      {loading ? "Redirecting to checkout..." : "Buy Now →"}
    </Button>
  );
}
