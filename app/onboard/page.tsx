"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const PERKS = [
  { icon: "💰", title: "Keep 80% of every sale", desc: "Our 20% platform fee is among the lowest in the industry." },
  { icon: "🚀", title: "Instant payouts", desc: "Request payouts at any time. No monthly minimums." },
  { icon: "📊", title: "Deep analytics", desc: "Track views, conversions, and revenue in real-time." },
  { icon: "🌍", title: "Global audience", desc: "Sell to buyers in 190+ countries via Stripe." },
  { icon: "🔒", title: "Secure delivery", desc: "Customers get your prompt only after payment." },
  { icon: "⭐", title: "Build reputation", desc: "Reviews, ratings, and a public creator profile." },
];

export default function OnboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(session?.user?.name ?? "");
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [twitter, setTwitter] = useState("");
  const [payoutEmail, setPayoutEmail] = useState(session?.user?.email ?? "");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">You need to be signed in to become a creator.</p>
          <Link href="/login?callbackUrl=/onboard">
            <Button className="bg-violet-600 hover:bg-violet-500 text-white">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (session.user.role === "creator") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">You&apos;re already a creator!</h2>
          <Link href="/dashboard">
            <Button className="bg-violet-600 hover:bg-violet-500 text-white">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit() {
    if (!agreed) { setError("Please agree to the creator terms."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/creator/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, username: username.trim().toLowerCase() || undefined, headline, bio, website, twitter, payoutEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to onboard."); }
      else { router.push("/dashboard?welcome=1"); }
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {step === 1 && (
          <div>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-400 mb-4">
                Creator Program
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Turn your prompts into income</h1>
              <p className="text-zinc-400 text-lg">
                Join thousands of creators earning on PromptVault. Set up your store in 2 minutes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {PERKS.map((perk) => (
                <div key={perk.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                  <div className="text-2xl mb-2">{perk.icon}</div>
                  <h3 className="font-semibold text-white text-sm mb-1">{perk.title}</h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{perk.desc}</p>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setStep(2)}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 text-base rounded-xl"
            >
              Start Creator Setup →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white transition-colors text-sm">
                  ← Back
                </button>
                <span className="text-zinc-600 text-sm">Step 1 of 2</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Your creator profile</h2>
              <p className="text-zinc-400 text-sm mt-1">This is how buyers will see you on the marketplace.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Display Name *</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name or brand" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Username <span className="text-zinc-500 font-normal">(your public profile URL)</span></label>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-sm shrink-0">promptvault.dev/creator/</span>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                    placeholder="your-username"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Headline</label>
                <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. AI prompt engineer & developer tools creator" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell buyers about yourself and what you create..." rows={3} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Website</label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Twitter / X</label>
                  <input value={twitter} onChange={e => setTwitter(e.target.value)} placeholder="@handle" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
              </div>
            </div>

            <Button onClick={() => setStep(3)} disabled={!displayName.trim()} className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 text-base rounded-xl disabled:opacity-50">
              Continue →
            </Button>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep(2)} className="text-zinc-500 hover:text-white transition-colors text-sm">← Back</button>
                <span className="text-zinc-600 text-sm">Step 2 of 2</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Payout details</h2>
              <p className="text-zinc-400 text-sm mt-1">How we&apos;ll send your earnings. You can update this anytime.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-4 text-sm text-violet-300">
                <strong>Creator earnings: 80%</strong> — PromptVault takes a 20% platform fee on each sale.
                Payouts are processed via Stripe to your bank account or debit card.
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Payout Email</label>
                <input type="email" value={payoutEmail} onChange={e => setPayoutEmail(e.target.value)} placeholder="your-payout@email.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                <p className="text-xs text-zinc-500 mt-1.5">We&apos;ll use this to set up your Stripe Express account.</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5 accent-violet-500" />
                <span className="text-sm text-zinc-400">
                  I agree to the{" "}
                  <Link href="/creator-terms" className="text-violet-400 hover:underline">Creator Terms</Link>
                  {" "}and understand the 80/20 revenue split.
                </span>
              </label>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={loading || !agreed || !payoutEmail.trim()} className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 text-base rounded-xl disabled:opacity-50">
              {loading ? "Setting up your store..." : "Launch My Creator Store →"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
