"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Best Selling" },
  { value: "top-rated", label: "Top Rated" },
  { value: "most-reviewed", label: "Most Reviewed" },
  { value: "price-low", label: "Price: Low" },
  { value: "price-high", label: "Price: High" },
];

const PRICING = [
  { value: "", label: "Any Price" },
  { value: "free", label: "Free" },
  { value: "under10", label: "Under $10" },
  { value: "paid", label: "Paid" },
];

export function BrowseFilters({ currentSort, currentPricing }: { currentSort: string; currentPricing?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/browse?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500 mr-1">Sort:</span>
        {SORTS.map((s) => (
          <button
            key={s.value}
            onClick={() => updateParam("sort", s.value)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              currentSort === s.value ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="w-px h-4 bg-zinc-700" />
      <div className="flex items-center gap-1">
        <span className="text-xs text-zinc-500 mr-1">Price:</span>
        {PRICING.map((p) => (
          <button
            key={p.value}
            onClick={() => updateParam("pricing", p.value)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              (currentPricing ?? "") === p.value ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
