import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  generateState, generatePKCE,
  buildXAuthUrl, buildRedditAuthUrl,
} from "@/lib/publisher/oauth";

const ONE_HOUR = 60 * 60;

export async function GET(req: NextRequest, { params }: { params: Promise<{ platform: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { platform } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const redirectUri = `${baseUrl}/api/publisher/oauth/callback/${platform}`;

  const state = generateState();
  const response = new NextResponse();

  // Store state in cookie (validated on callback to prevent CSRF)
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: ONE_HOUR,
    path: "/",
  };

  let authUrl: string;

  if (platform === "x") {
    const clientId = process.env.X_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(
        new URL("/publisher/accounts?error=X_CLIENT_ID+not+configured", req.url)
      );
    }

    const { codeVerifier, codeChallenge } = generatePKCE();

    const res = NextResponse.redirect(
      buildXAuthUrl({ clientId, redirectUri, state, codeChallenge })
    );
    res.cookies.set("pub_oauth_state", state, cookieOptions);
    res.cookies.set("pub_oauth_verifier", codeVerifier, cookieOptions);
    return res;
  }

  if (platform === "reddit") {
    const clientId = process.env.REDDIT_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(
        new URL("/publisher/accounts?error=REDDIT_CLIENT_ID+not+configured", req.url)
      );
    }

    authUrl = buildRedditAuthUrl({ clientId, redirectUri, state });
    const res = NextResponse.redirect(authUrl);
    res.cookies.set("pub_oauth_state", state, cookieOptions);
    return res;
  }

  return NextResponse.redirect(
    new URL(`/publisher/accounts?error=Unsupported+platform:+${platform}`, req.url)
  );
}
