"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

export function ClaimButton({ promptId }: { promptId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!session) {
    return (
      <Link
        href="/login"
        className="block w-full text-center bg-white text-black hover:bg-zinc-200 font-semibold py-3 rounded-xl transition-colors text-base"
      >
        Sign in to Get for Free →
      </Link>
    );
  }

  if (state === "done") {
    return (
      <div className="space-y-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400 text-center">
          ✓ Claimed! Check your email for the prompt.
        </div>
        <Link
          href="/purchases"
          className="block text-center text-sm text-zinc-400 hover:text-white transition-colors"
        >
          View in My Purchases →
        </Link>
      </div>
    );
  }

  async function claim() {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`/api/prompts/${promptId}/claim`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setState("error");
      } else {
        setState("done");
        router.refresh();
      }
    } catch {
      setErrorMsg("Something went wrong.");
      setState("error");
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={claim}
        disabled={state === "loading"}
        className="w-full bg-white text-black hover:bg-zinc-200 font-semibold py-3 rounded-xl transition-colors text-base disabled:opacity-60"
      >
        {state === "loading" ? "Claiming..." : "Get for Free →"}
      </button>
      {state === "error" && (
        <p className="text-xs text-red-400 text-center">{errorMsg}</p>
      )}
    </div>
  );
}
