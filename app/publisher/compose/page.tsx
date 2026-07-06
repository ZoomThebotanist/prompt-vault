import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { publisherAccounts, publisherCampaigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ComposeForm } from "@/components/publisher/compose-form";

export default async function ComposePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  const [accounts, campaigns] = await Promise.all([
    db.select().from(publisherAccounts).where(eq(publisherAccounts.userId, session.user.id)),
    db.select().from(publisherCampaigns).where(eq(publisherCampaigns.userId, session.user.id)),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Compose Post</h1>
        <p className="text-zinc-500 text-sm mt-1">Create and schedule content across your platforms</p>
      </div>
      <ComposeForm accounts={accounts} campaigns={campaigns} />
    </div>
  );
}
