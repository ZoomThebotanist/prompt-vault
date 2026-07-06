import type { PlatformAdapter, PlatformSlug } from "../types";
import { xAdapter } from "./x";
import { redditAdapter } from "./reddit";

const adapters: Partial<Record<PlatformSlug, PlatformAdapter>> = {
  x: xAdapter,
  reddit: redditAdapter,
};

export function getAdapter(platform: PlatformSlug): PlatformAdapter {
  const adapter = adapters[platform];
  if (!adapter) throw new Error(`No adapter registered for platform: ${platform}`);
  return adapter;
}

export function hasAdapter(platform: PlatformSlug): boolean {
  return Boolean(adapters[platform]);
}

export { xAdapter, redditAdapter };
