import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user, creatorApplications, creatorProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { action, reason } = await req.json(); // action: "approve" | "reject"

  const [application] = await db.select().from(creatorApplications)
    .where(eq(creatorApplications.id, id)).limit(1);

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  if (action === "approve") {
    // Create creator profile
    const existingProfile = await db.select({ id: creatorProfiles.id })
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, application.userId))
      .limit(1);

    if (existingProfile.length === 0) {
      await db.insert(creatorProfiles).values({
        userId: application.userId,
        displayName: application.displayName,
        headline: application.headline,
        bio: application.bio,
        website: application.website,
        twitterHandle: application.twitterHandle,
        githubHandle: application.githubHandle,
        payoutEmail: application.payoutEmail,
        onboardedAt: new Date(),
      });
    }

    // Upgrade user role to creator
    await db.update(user).set({
      role: "creator",
      updatedAt: new Date(),
      ...(application.username ? { username: application.username } : {}),
    }).where(eq(user.id, application.userId));

    // Update application status
    await db.update(creatorApplications).set({
      status: "approved",
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(creatorApplications.id, id));

    // Send approval email if Resend is configured
    try {
      const [applicant] = await db.select({ email: user.email, name: user.name })
        .from(user).where(eq(user.id, application.userId)).limit(1);

      if (applicant) {
        const { getResend } = await import("@/lib/resend");
        const resendClient = getResend();
        await resendClient.emails.send({
          from: "PromptVault <noreply@promptvault.dev>",
          to: applicant.email,
          subject: "🎉 Your creator application was approved!",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="text-align:center;margin:0 0 24px">
                <span style="color:#111">Prompt</span><span style="color:#7c3aed">Vault</span>
              </h2>
              <p>Hi ${applicant.name},</p>
              <p>Great news — your creator application has been <strong>approved</strong>!</p>
              <p>You can now upload products and start earning. Head to your creator dashboard to get started.</p>
              <div style="text-align:center;margin:24px 0">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/dashboard"
                   style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600">
                  Go to Dashboard
                </a>
              </div>
              <p style="color:#6b7280;font-size:12px">Welcome to the creator community!</p>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error("[admin] Failed to send approval email:", err);
    }

    return NextResponse.json({ success: true, action: "approved" });
  }

  if (action === "reject") {
    await db.update(creatorApplications).set({
      status: "rejected",
      rejectionReason: reason ?? null,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(creatorApplications.id, id));

    // Send rejection email
    try {
      const [applicant] = await db.select({ email: user.email, name: user.name })
        .from(user).where(eq(user.id, application.userId)).limit(1);

      if (applicant) {
        const { getResend } = await import("@/lib/resend");
        const resendClient = getResend();
        await resendClient.emails.send({
          from: "PromptVault <noreply@promptvault.dev>",
          to: applicant.email,
          subject: "Your PromptVault creator application",
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
              <h2 style="text-align:center;margin:0 0 24px">
                <span style="color:#111">Prompt</span><span style="color:#7c3aed">Vault</span>
              </h2>
              <p>Hi ${applicant.name},</p>
              <p>Thank you for applying to become a creator on PromptVault.</p>
              <p>After review, we weren't able to approve your application at this time.${reason ? ` Reason: <em>${reason}</em>` : ""}</p>
              <p>You're welcome to reapply once you've built out your portfolio. If you have questions, reply to this email.</p>
              <p style="color:#6b7280;font-size:12px">The PromptVault Team</p>
            </div>
          `,
        });
      }
    } catch (err) {
      console.error("[admin] Failed to send rejection email:", err);
    }

    return NextResponse.json({ success: true, action: "rejected" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
