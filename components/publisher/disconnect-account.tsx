"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export function DisconnectAccount({ accountId }: { accountId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function disconnect() {
    await fetch(`/api/publisher/accounts/${accountId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button onClick={disconnect} className="text-xs text-red-400 hover:text-red-300 font-medium">Confirm</button>
        <button onClick={() => setConfirming(false)} className="text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Disconnect"
      className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
