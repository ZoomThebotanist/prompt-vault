import type { PostStatus } from "@/lib/publisher/types";
import { STATUS_META } from "@/lib/publisher/types";

const colorMap: Record<string, string> = {
  zinc:    "bg-zinc-700/50 text-zinc-400",
  blue:    "bg-blue-500/10 text-blue-400",
  amber:   "bg-amber-500/10 text-amber-400",
  violet:  "bg-violet-500/10 text-violet-400",
  emerald: "bg-emerald-500/10 text-emerald-400",
  orange:  "bg-orange-500/10 text-orange-400",
  red:     "bg-red-500/10 text-red-400",
};

const dotMap: Record<string, string> = {
  zinc:    "bg-zinc-500",
  blue:    "bg-blue-400",
  amber:   "bg-amber-400",
  violet:  "bg-violet-400 animate-pulse",
  emerald: "bg-emerald-400",
  orange:  "bg-orange-400",
  red:     "bg-red-400",
};

export function StatusBadge({ status }: { status: PostStatus | string }) {
  const meta = STATUS_META[status as PostStatus] ?? { label: status, color: "zinc" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[meta.color] ?? colorMap.zinc}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotMap[meta.color] ?? dotMap.zinc}`} />
      {meta.label}
    </span>
  );
}
