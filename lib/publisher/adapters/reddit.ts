import type { PlatformAdapter, PlatformContent, ValidationResult, PublishResult } from "../types";

export const redditAdapter: PlatformAdapter = {
  platform: "reddit",
  maxCharacters: 40000,
  supportsMedia: true,
  supportsVideo: false,

  validate(content: PlatformContent): ValidationResult {
    const errors = [];
    if (!content.text && !content.link) {
      errors.push({ field: "text", code: "CONTENT_REQUIRED", message: "Post text or a link is required" });
    }
    if (content.text && content.text.length > 40000) {
      errors.push({ field: "text", code: "TEXT_TOO_LONG", message: "Text exceeds Reddit's 40,000 character limit" });
    }
    return { valid: errors.length === 0, errors };
  },

  transform(content: PlatformContent): Record<string, unknown> {
    const isLink = Boolean(content.link) && !content.text;
    return {
      kind: isLink ? "link" : "self",
      title: content.text?.split("\n")[0]?.slice(0, 300) ?? "Shared from Prompt Vault",
      text: isLink ? undefined : content.text,
      url: isLink ? content.link : undefined,
      // sr (subreddit) must be provided at publish time via account metadata
    };
  },

  async publish(payload: Record<string, unknown>, accessToken: string): Promise<PublishResult> {
    const res = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PromptVault/1.0",
      },
      body: new URLSearchParams({
        api_type: "json",
        kind: String(payload.kind ?? "self"),
        title: String(payload.title ?? ""),
        text: String(payload.text ?? ""),
        url: String(payload.url ?? ""),
        sr: String(payload.sr ?? ""),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Reddit API error ${res.status}: ${body}`);
    }

    const data = await res.json() as { json: { data: { id: string; url: string } } };
    return {
      platformPostId: data.json.data.id,
      publishedUrl: data.json.data.url,
    };
  },
};
