import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
    usePlural: false,
  }),
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      try {
        const { getResend } = await import("@/lib/resend");
        const resendClient = getResend();
        await resendClient.emails.send({
          from: "PromptVault <noreply@promptvault.dev>",
          to: user.email,
          subject: "Reset your PromptVault password",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="background:#0a0a0a;padding:16px;border-radius:8px;text-align:center;margin:0 0 24px">
                <span style="color:#fff">Prompt</span><span style="color:#7c3aed">Vault</span>
              </h2>
              <p style="color:#374151">Hi ${user.name},</p>
              <p style="color:#374151">Click the button below to reset your password. This link expires in 1 hour.</p>
              <div style="text-align:center;margin:24px 0">
                <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">
                  Reset Password
                </a>
              </div>
              <p style="color:#6b7280;font-size:12px">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("[auth] Failed to send reset password email:", err);
      }
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
  ],
  user: {
    additionalFields: {
      username: { type: "string", required: false },
      bio: { type: "string", required: false },
      website: { type: "string", required: false },
      twitterHandle: { type: "string", required: false },
      role: { type: "string", required: false, defaultValue: "buyer" },
      banned: { type: "boolean", required: false, defaultValue: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,
  },
});

export type Auth = typeof auth;
