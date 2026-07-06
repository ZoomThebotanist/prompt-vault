import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/settings");

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">{session.user.email}</p>
        </div>
        <SettingsForm
          userId={session.user.id}
          initial={{
            name: session.user.name,
            username: (session.user as { username?: string }).username ?? "",
            bio: (session.user as { bio?: string }).bio ?? "",
          }}
        />
      </div>
    </div>
  );
}
