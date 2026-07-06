import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ManualTokenForm } from "@/components/publisher/manual-token-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ManualAccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link
        href="/publisher/accounts"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Accounts
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Manual Token Setup</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Add an account using an existing API token. Useful for developer apps and bot accounts.
        </p>
      </div>

      {/* Platform guides */}
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {[
          {
            platform: "X (Twitter)",
            steps: [
              "Go to developer.twitter.com",
              "Create a project + app",
              "Enable OAuth 2.0 with read/write permissions",
              "Generate a Bearer Token under \"Keys and Tokens\"",
            ],
            url: "https://developer.twitter.com/en/portal/dashboard",
          },
          {
            platform: "Reddit",
            steps: [
              "Go to reddit.com/prefs/apps",
              "Create a \"script\" type app",
              "Use your username/password to generate a token",
              "Or use the OAuth flow above for better security",
            ],
            url: "https://www.reddit.com/prefs/apps",
          },
        ].map((guide) => (
          <div key={guide.platform} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-white font-medium text-sm mb-2">{guide.platform}</p>
            <ol className="space-y-1">
              {guide.steps.map((step, i) => (
                <li key={i} className="text-zinc-500 text-xs flex gap-2">
                  <span className="text-zinc-700 font-mono">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
            <a
              href={guide.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:text-violet-300 mt-3 inline-block"
            >
              Open developer portal →
            </a>
          </div>
        ))}
      </div>

      <ManualTokenForm />
    </div>
  );
}
