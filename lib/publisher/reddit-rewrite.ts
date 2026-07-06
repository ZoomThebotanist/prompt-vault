import Anthropic from "@anthropic-ai/sdk";

interface RedditRewrite {
  title: string;
  body: string;
}

export async function rewriteForReddit(
  originalText: string,
  subreddit: string
): Promise<RedditRewrite | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Rewrite this content as a genuine Reddit post for r/${subreddit}.

Rules:
- Write as a real person sharing something useful, NOT as a brand or marketer
- Focus on the value or insight — do NOT mention any website, product name, or brand in the body
- Be conversational and appropriate for the community
- Title should be Reddit-style: a question, observation, or statement that sparks engagement (max 300 chars)
- Body should be 2-5 sentences — concise, honest, adds real value
- The link will be posted separately as the first comment, so do not include any URLs in body or title

Return ONLY valid JSON with exactly these two fields, nothing else:
{"title": "...", "body": "..."}

Original content to rewrite:
${originalText}`,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") return null;

    const match = textContent.text.match(/\{[\s\S]*?\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]) as { title?: string; body?: string };
    if (typeof parsed.title !== "string" || typeof parsed.body !== "string") return null;

    return {
      title: parsed.title.slice(0, 300),
      body: parsed.body.slice(0, 40000),
    };
  } catch {
    return null;
  }
}
