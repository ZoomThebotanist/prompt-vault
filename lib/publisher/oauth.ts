import { randomBytes, createHash } from "crypto";

// ─── PKCE (used by X OAuth 2.0) ───────────────────────────────────────────────

export function generatePKCE() {
  const codeVerifier = randomBytes(32).toString("base64url");
  const codeChallenge = createHash("sha256").update(codeVerifier).digest("base64url");
  return { codeVerifier, codeChallenge };
}

export function generateState(): string {
  return randomBytes(16).toString("hex");
}

// ─── X (Twitter) OAuth 2.0 ────────────────────────────────────────────────────

const X_AUTH_URL = "https://twitter.com/i/oauth2/authorize";
const X_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
const X_USER_URL = "https://api.twitter.com/2/users/me";
const X_SCOPES = "tweet.write tweet.read users.read offline.access";

export function buildXAuthUrl(params: { clientId: string; redirectUri: string; state: string; codeChallenge: string }): string {
  const url = new URL(X_AUTH_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("scope", X_SCOPES);
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function exchangeXCode(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; scope: string }> {
  const basicAuth = Buffer.from(`${params.clientId}:${params.clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    code_verifier: params.codeVerifier,
  });

  const res = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`X token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number; scope: string };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

export async function fetchXProfile(accessToken: string): Promise<{ id: string; username: string; name: string; profileImageUrl?: string }> {
  const res = await fetch(`${X_USER_URL}?user.fields=profile_image_url`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch X profile: ${res.status}`);
  const data = await res.json() as { data: { id: string; username: string; name: string; profile_image_url?: string } };
  return {
    id: data.data.id,
    username: data.data.username,
    name: data.data.name,
    profileImageUrl: data.data.profile_image_url,
  };
}

export async function refreshXToken(params: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const basicAuth = Buffer.from(`${params.clientId}:${params.clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
    client_id: params.clientId,
  });

  const res = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`X token refresh failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number };
  return { accessToken: data.access_token, refreshToken: data.refresh_token, expiresIn: data.expires_in };
}

// ─── Reddit OAuth 2.0 ─────────────────────────────────────────────────────────

const REDDIT_AUTH_URL = "https://www.reddit.com/api/v1/authorize";
const REDDIT_TOKEN_URL = "https://www.reddit.com/api/v1/access_token";
const REDDIT_USER_URL = "https://oauth.reddit.com/api/v1/me";
const REDDIT_SCOPES = "submit identity";

export function buildRedditAuthUrl(params: { clientId: string; redirectUri: string; state: string }): string {
  const url = new URL(REDDIT_AUTH_URL);
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", params.state);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("duration", "permanent"); // gets refresh token
  url.searchParams.set("scope", REDDIT_SCOPES);
  return url.toString();
}

export async function exchangeRedditCode(params: {
  code: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ accessToken: string; refreshToken: string; expiresIn: number; scope: string }> {
  const basicAuth = Buffer.from(`${params.clientId}:${params.clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
  });

  const res = await fetch(REDDIT_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
      "User-Agent": "PromptVault/1.0",
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit token exchange failed (${res.status}): ${text}`);
  }

  const data = await res.json() as { access_token: string; refresh_token: string; expires_in: number; scope: string };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    scope: data.scope,
  };
}

export async function fetchRedditProfile(accessToken: string): Promise<{ id: string; username: string; name: string; iconUrl?: string }> {
  const res = await fetch(REDDIT_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "PromptVault/1.0",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch Reddit profile: ${res.status}`);
  const data = await res.json() as { id: string; name: string; icon_img?: string };
  return { id: data.id, username: data.name, name: data.name, iconUrl: data.icon_img };
}

export async function refreshRedditToken(params: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}): Promise<{ accessToken: string; expiresIn: number }> {
  const basicAuth = Buffer.from(`${params.clientId}:${params.clientSecret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
  });

  const res = await fetch(REDDIT_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basicAuth}`,
      "User-Agent": "PromptVault/1.0",
    },
    body: body.toString(),
  });

  if (!res.ok) throw new Error(`Reddit token refresh failed: ${res.status}`);
  const data = await res.json() as { access_token: string; expires_in: number };
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}
