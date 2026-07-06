import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  getSession,
} = authClient;

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "";

export async function requestPasswordReset(opts: { email: string; redirectTo?: string }) {
  const res = await fetch(`${BASE}/api/auth/request-password-reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Failed to send reset email");
  }
  return res.json();
}

export async function doResetPassword(opts: { newPassword: string; token: string }) {
  const res = await fetch(`${BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? "Failed to reset password");
  }
  return res.json();
}
