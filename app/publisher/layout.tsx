import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { PublisherSidebar } from "@/components/publisher/publisher-sidebar";

export default async function PublisherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?callbackUrl=/publisher");
  if (session.user.role !== "creator" && session.user.role !== "admin") redirect("/onboard");

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <PublisherSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
