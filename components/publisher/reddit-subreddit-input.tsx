"use client";

import { useState, useTransition } from "react";
import { updateRedditSubreddit } from "@/app/publisher/accounts/actions";
import { Check, Loader2 } from "lucide-react";

interface Props {
  accountId: string;
  currentSubreddit: string;
}

export function RedditSubredditInput({ accountId, currentSubreddit }: Props) {
  const [value, setValue] = useState(currentSubreddit);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      await updateRedditSubreddit(accountId, value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-zinc-500 text-xs shrink-0">r/</span>
      <input
        type="text"
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false); }}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder="subreddit name"
        className="flex-1 min-w-0 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500"
      />
      <button
        onClick={handleSave}
        disabled={isPending || !value.trim()}
        className="shrink-0 flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : saved ? (
          <><Check className="w-3 h-3" /> Saved</>
        ) : (
          "Save"
        )}
      </button>
    </div>
  );
}
