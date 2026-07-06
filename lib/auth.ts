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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
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
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
  },
});

export type Auth = typeof auth;
