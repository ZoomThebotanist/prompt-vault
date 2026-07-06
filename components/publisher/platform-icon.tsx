import type { PlatformSlug } from "@/lib/publisher/types";
import { PLATFORM_META } from "@/lib/publisher/types";

interface Props {
  platform: PlatformSlug;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "w-5 h-5 text-[10px]", md: "w-7 h-7 text-xs", lg: "w-9 h-9 text-sm" };

const initials: Record<PlatformSlug, string> = {
  x: "𝕏", reddit: "r/", linkedin: "in", instagram: "IG", facebook: "f",
  tiktok: "TK", youtube: "YT", bluesky: "BS", threads: "TH", pinterest: "P",
};

export function PlatformIcon({ platform, size = "md" }: Props) {
  const meta = PLATFORM_META[platform];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-bold flex-shrink-0 ${sizes[size]}`}
      style={{ backgroundColor: meta.bgColor, color: meta.color }}
      title={meta.label}
    >
      {initials[platform]}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: PlatformSlug }) {
  const meta = PLATFORM_META[platform];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: `${meta.bgColor}20`, color: meta.bgColor === "#000" || meta.bgColor === "#010101" ? "#aaa" : meta.bgColor }}
    >
      {meta.label}
    </span>
  );
}
