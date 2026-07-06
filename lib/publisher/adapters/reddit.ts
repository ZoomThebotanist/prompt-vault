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
    // Always post as text ("self") so it won't be spam-filtered as a link post.
    // The link is stored in commentLink and posted as the first comment after submission.
    const firstLine = content.text?.split("\n")[0]?.slice(0, 300) ?? "";
    const title = firstLine || "Shared from Prompt Vault";
    // Body is the full text without the first line used as title (if multi-line), else full text
    const lines = content.text?.split("\n") ?? [];
    const body = lines.length > 1 ? lines.slice(1).join("\n").trim() : (content.text ?? "");

    return {
      kind: "self",
      title,
      text: body,
      commentLink: content.link ?? null,
      // sr (subreddit) is injected by queue.ts from account metadata
    };
  },

  async publish(payload: Record<string, unknown>, accessToken: string): Promise<PublishResult> {
    const sr = String(payload.sr ?? "").replace(/^r\//, "").trim();
    if (!sr) throw new Error("Reddit account is missing a subreddit — edit the account and add one");

    const res = await fetch("https://oauth.reddit.com/api/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PromptVault/1.0",
      },
      body: new URLSearchParams({
        api_type: "json",
        kind: "self",
        sr,
        title: String(payload.title ?? ""),
        text: String(payload.text ?? ""),
      }),
    });

    const raw = await res.json() as {
      json?: {
        errors?: [string, string, string][];
        data?: { id?: string; url?: string; name?: string };
      };
    };

    // Reddit returns HTTP 200 even on errors — check the JSON body
    const errors = raw?.json?.errors;
    if (errors && errors.length > 0) {
      const msg = errors.map(([code, message]) => `${code}: ${message}`).join("; ");
      throw new Error(`Reddit rejected post: ${msg}`);
    }

    if (!res.ok) {
      throw new Error(`Reddit API error ${res.status}`);
    }

    const postId = raw?.json?.data?.id ?? raw?.json?.data?.name?.replace("t3_", "");
    const postUrl = raw?.json?.data?.url ?? "";

    if (!postId) throw new Error("Reddit did not return a post ID");

    // Post the website link as the first comment so the post stays spam-filter-safe
    const commentLink = payload.commentLink as string | null;
    if (commentLink) {
      await postLinkAsComment(accessToken, postId, commentLink);
    }

    return {
      platformPostId: postId,
      publishedUrl: postUrl,
    };
  },
};

async function postLinkAsComment(accessToken: string, postId: string, link: string): Promise<void> {
  try {
    const res = await fetch("https://oauth.reddit.com/api/comment", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "PromptVault/1.0",
      },
      body: new URLSearchParams({
        api_type: "json",
        thing_id: `t3_${postId}`,
        text: link,
      }),
    });

    const raw = await res.json() as { json?: { errors?: [string, string, string][] } };
    const errors = raw?.json?.errors;
    if (errors && errors.length > 0) {
      // Non-fatal — post succeeded, just log the comment failure
      console.error(`Reddit comment post failed: ${errors.map(([c, m]) => `${c}: ${m}`).join("; ")}`);
    }
  } catch (err) {
    // Non-fatal — the post itself succeeded
    console.error("Failed to post link as Reddit comment:", err);
  }
}
