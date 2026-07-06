import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherAccounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  exchangeXCode, fetchXProfile,
  exchangeRedditCode, fetchRedditProfile,
} from "@/lib/publisher/oauth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));

  const { platform } = await params;
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const redirectUri = `${baseUrl}/api/publisher/oauth/callback/${platform}`;

  function fail(msg: string) {
    const url = new URL("/publisher/accounts", req.url);
    url.searchParams.set("error", msg);
    const res = NextResponse.redirect(url);
    res.cookies.delete("pub_oauth_state");
    res.cookies.delete("pub_oauth_verifier");
    return res;
  }

  function success() {
    const url = new URL("/publisher/accounts", req.url);
    url.searchParams.set("connected", platform);
    const res = NextResponse.redirect(url);
    res.cookies.delete("pub_oauth_state");
    res.cookies.delete("pub_oauth_verifier");
    return res;
  }

  // Check for OAuth error from platform
  if (error) return fail(`${platform} denied: ${error}`);
  if (!code) return fail("No authorization code received");

  // Validate state (CSRF protection)
  const storedState = req.cookies.get("pub_oauth_state")?.value;
  if (!storedState || storedState !== returnedState) {
    return fail("State mismatch — possible CSRF. Please try again.");
  }

  try {
    if (platform === "x") {
      const clientId = process.env.X_CLIENT_ID!;
      const clientSecret = process.env.X_CLIENT_SECRET!;
      const codeVerifier = req.cookies.get("pub_oauth_verifier")?.value;
      if (!codeVerifier) return fail("PKCE verifier missing — please try again");

      const tokens = await exchangeXCode({ code, codeVerifier, redirectUri, clientId, clientSecret });
      const profile = await fetchXProfile(tokens.accessToken);

      await upsertAccount({
        userId: session.user.id,
        platform: "x",
        accountHandle: profile.username,
        accountName: profile.name,
        avatarUrl: profile.profileImageUrl,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        scopes: tokens.scope.split(" "),
      });

      return success();
    }

    if (platform === "reddit") {
      const clientId = process.env.REDDIT_CLIENT_ID!;
      const clientSecret = process.env.REDDIT_CLIENT_SECRET!;

      const tokens = await exchangeRedditCode({ code, redirectUri, clientId, clientSecret });
      const profile = await fetchRedditProfile(tokens.accessToken);

      await upsertAccount({
        userId: session.user.id,
        platform: "reddit",
        accountHandle: profile.username,
        accountName: profile.name,
        avatarUrl: profile.iconUrl,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        scopes: tokens.scope.split(" "),
      });

      return success();
    }

    return fail(`Unsupported platform: ${platform}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error(`OAuth callback error [${platform}]:`, msg);
    return fail(msg.slice(0, 100));
  }
}

async function upsertAccount(data: {
  userId: string;
  platform: string;
  accountHandle: string;
  accountName?: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scopes?: string[];
}) {
  const tokenExpiresAt = data.expiresIn
    ? new Date(Date.now() + data.expiresIn * 1000)
    : null;

  // Check if account already exists (re-connect flow)
  const [existing] = await db
    .select({ id: publisherAccounts.id })
    .from(publisherAccounts)
    .where(
      and(
        eq(publisherAccounts.userId, data.userId),
        eq(publisherAccounts.platform, data.platform),
        eq(publisherAccounts.accountHandle, data.accountHandle)
      )
    );

  if (existing) {
    await db
      .update(publisherAccounts)
      .set({
        accountName: data.accountName,
        avatarUrl: data.avatarUrl,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken ?? null,
        tokenExpiresAt,
        scopes: data.scopes ?? [],
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(publisherAccounts.id, existing.id));
  } else {
    await db.insert(publisherAccounts).values({
      userId: data.userId,
      platform: data.platform,
      accountHandle: data.accountHandle,
      accountName: data.accountName,
      avatarUrl: data.avatarUrl,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? null,
      tokenExpiresAt,
      scopes: data.scopes ?? [],
      isActive: true,
    });
  }
}
