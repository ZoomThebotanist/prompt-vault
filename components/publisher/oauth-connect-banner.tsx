"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { PLATFORM_META } from "@/lib/publisher/types";
import type { PlatformSlug } from "@/lib/publisher/types";

export function OAuthConnectBanner({ connected, error }: { connected?: string; error?: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || (!connected && !error)) return null;

  if (connected) {
    const meta = PLATFORM_META[connected as PlatformSlug];
    return (
      <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <p className="text-emerald-300 text-sm flex-1">
          <span className="font-semibold">{meta?.label ?? connected}</span> connected successfully! You can now publish to this account.
        </p>
        <button onClick={() => setDismissed(true)} className="text-emerald-600 hover:text-emerald-400">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      <p className="text-red-300 text-sm flex-1">
        <span className="font-semibold">Connection failed:</span> {decodeURIComponent(error ?? "Unknown error")}
      </p>
      <button onClick={() => setDismissed(true)} className="text-red-600 hover:text-red-400">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
