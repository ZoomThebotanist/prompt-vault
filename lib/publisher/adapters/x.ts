import type { PlatformAdapter, PlatformContent, ValidationResult, PublishResult } from "../types";

export const xAdapter: PlatformAdapter = {
  platform: "x",
  maxCharacters: 280,
  supportsMedia: true,
  supportsVideo: true,

  validate(content: PlatformContent): ValidationResult {
    const errors = [];
    const text = content.text ?? "";
    if (text.length > 280) {
      errors.push({ field: "text", code: "TEXT_TOO_LONG", message: `Text is ${text.length} characters (max 280)` });
    }
    if (text.length === 0) {
      errors.push({ field: "text", code: "TEXT_REQUIRED", message: "Post text is required" });
    }
    if ((content.mediaUrls?.length ?? 0) > 4) {
      errors.push({ field: "mediaUrls", code: "TOO_MANY_IMAGES", message: "X supports a maximum of 4 images" });
    }
    return { valid: errors.length === 0, errors };
  },

  transform(content: PlatformContent): Record<string, unknown> {
    const hashtags = (content.hashtags ?? []).map((h) => `#${h.replace(/^#/, "")}`).join(" ");
    const text = [content.text, hashtags, content.link].filter(Boolean).join("\n\n").trim();
    return { text: text.slice(0, 280) };
  },

  async publish(payload: Record<string, unknown>, accessToken: string): Promise<PublishResult> {
    const res = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`X API error ${res.status}: ${body}`);
    }

    const data = await res.json() as { data: { id: string } };
    return {
      platformPostId: data.data.id,
      publishedUrl: `https://x.com/i/web/status/${data.data.id}`,
    };
  },
};
