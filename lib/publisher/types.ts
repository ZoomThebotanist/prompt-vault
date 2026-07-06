import type { PlatformSlug, PostStatus } from "@/db/schema";

export type { PlatformSlug, PostStatus };

export interface PlatformContent {
  text: string;
  hashtags: string[];
  link?: string;
  mediaUrls?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: { field: string; code: string; message: string }[];
}

export interface PublishResult {
  platformPostId: string;
  publishedUrl: string;
}

export interface PostMetrics {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  clicks?: number;
  reach?: number;
}

export interface PlatformAdapter {
  readonly platform: PlatformSlug;
  readonly maxCharacters: number;
  readonly supportsMedia: boolean;
  readonly supportsVideo: boolean;

  validate(content: PlatformContent): ValidationResult;
  transform(content: PlatformContent): Record<string, unknown>;
  publish(payload: Record<string, unknown>, accessToken: string): Promise<PublishResult>;
}

export const PLATFORM_META: Record<PlatformSlug, { label: string; color: string; bgColor: string; maxChars: number }> = {
  x:         { label: "X (Twitter)",  color: "#fff",    bgColor: "#000",     maxChars: 280 },
  reddit:    { label: "Reddit",        color: "#fff",    bgColor: "#FF4500",  maxChars: 40000 },
  linkedin:  { label: "LinkedIn",      color: "#fff",    bgColor: "#0077B5",  maxChars: 3000 },
  instagram: { label: "Instagram",     color: "#fff",    bgColor: "#E1306C",  maxChars: 2200 },
  facebook:  { label: "Facebook",      color: "#fff",    bgColor: "#1877F2",  maxChars: 63206 },
  tiktok:    { label: "TikTok",        color: "#fff",    bgColor: "#010101",  maxChars: 2200 },
  youtube:   { label: "YouTube",       color: "#fff",    bgColor: "#FF0000",  maxChars: 5000 },
  bluesky:   { label: "Bluesky",       color: "#fff",    bgColor: "#0085FF",  maxChars: 300 },
  threads:   { label: "Threads",       color: "#fff",    bgColor: "#000",     maxChars: 500 },
  pinterest: { label: "Pinterest",     color: "#fff",    bgColor: "#E60023",  maxChars: 500 },
};

export const STATUS_META: Record<PostStatus, { label: string; color: string }> = {
  draft:      { label: "Draft",      color: "zinc" },
  waiting:    { label: "Waiting",    color: "blue" },
  queued:     { label: "Queued",     color: "amber" },
  publishing: { label: "Publishing", color: "violet" },
  published:  { label: "Published",  color: "emerald" },
  partial:    { label: "Partial",    color: "orange" },
  failed:     { label: "Failed",     color: "red" },
  retrying:   { label: "Retrying",   color: "orange" },
  cancelled:  { label: "Cancelled",  color: "zinc" },
  archived:   { label: "Archived",   color: "zinc" },
};
