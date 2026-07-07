"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, Clock, XCircle } from "lucide-react";

const SPECIALTIES = [
  "Prompt Engineering", "Programming", "Automation", "Design",
  "Writing", "AI / ML", "Business", "Marketing", "Gaming", "Other",
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", desc: "Just getting started with AI tools" },
  { value: "intermediate", label: "Intermediate", desc: "Comfortable with AI workflows" },
  { value: "advanced", label: "Advanced", desc: "Building complex AI systems" },
  { value: "professional", label: "Professional", desc: "Full-time AI practitioner" },
];

const PAYMENT_METHODS = [
  { value: "stripe", label: "Stripe", desc: "Bank account or debit card" },
  { value: "paypal", label: "PayPal", desc: "PayPal account" },
  { value: "bank", label: "Bank Transfer", desc: "Direct ACH/wire transfer" },
];

type AppStatus = "none" | "pending" | "approved" | "rejected";

export default function OnboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [appStatus, setAppStatus] = useState<AppStatus>("none");
  const [statusLoading, setStatusLoading] = useState(true);

  // Form state
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [linkedinHandle, setLinkedinHandle] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("intermediate");
  const [payoutEmail, setPayoutEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Check existing application or creator status
  useEffect(() => {
    if (!session) return;
    if (session.user.role === "creator" || session.user.role === "admin") {
      setAppStatus("approved");
      setStatusLoading(false);
      return;
    }

    fetch("/api/creator/onboard")
      .then(r => r.json())
      .then(({ application }) => {
        if (application) {
          setAppStatus(application.status as AppStatus);
        } else {
          setAppStatus("none");
        }
      })
      .catch(() => setAppStatus("none"))
      .finally(() => setStatusLoading(false));

    setDisplayName(session.user.name ?? "");
    setPayoutEmail(session.user.email ?? "");
  }, [session]);

  async function handleSubmit() {
    if (!agreedToTerms) { setError("Please agree to the creator terms."); return; }
    if (!payoutEmail.trim()) { setError("Payout email is required."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/creator/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName, username, headline, bio, website, portfolio,
          twitterHandle, githubHandle, linkedinHandle, discordHandle,
          specialties, experienceLevel,
          payoutEmail, paymentMethod,
          agreedToTerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.alreadyCreator) { router.push("/dashboard"); return; }
        if (data.applicationPending) { router.push("/dashboard"); return; }
        setError(data.error ?? "Failed to submit application.");
      } else {
        router.push("/dashboard");
      }
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  function toggleSpecialty(s: string) {
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (sessionLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not signed in ────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-5">✦</div>
          <h2 className="text-xl font-bold text-white mb-2">Sign in to apply</h2>
          <p className="text-zinc-400 text-sm mb-6">Create an account or sign in to start your creator application.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/login?callbackUrl=/onboard">
              <Button variant="outline" className="border-zinc-700 text-zinc-300">Sign In</Button>
            </Link>
            <Link href="/register?callbackUrl=/onboard">
              <Button className="bg-violet-600 hover:bg-violet-500 text-white">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Already approved / creator ────────────────────────────────────────────
  if (appStatus === "approved") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">You&apos;re already a creator!</h2>
          <p className="text-zinc-400 text-sm mb-6">Your creator account is active. Head to your dashboard to manage products and earnings.</p>
          <Link href="/dashboard">
            <Button className="bg-violet-600 hover:bg-violet-500 text-white">Go to Dashboard →</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Pending application ───────────────────────────────────────────────────
  if (appStatus === "pending" || submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Application submitted!</h2>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Our team typically reviews applications within <strong className="text-white">24–48 hours</strong>.
            You&apos;ll receive an email at <strong className="text-white">{session.user.email}</strong> once a decision is made.
          </p>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-left space-y-3 mb-6">
            {[
              "✓ Application received",
              "⏳ Under review by our team",
              "○ Email notification sent",
              "○ Creator dashboard access granted",
            ].map((s, i) => (
              <p key={i} className={`text-sm ${i < 2 ? "text-zinc-300" : "text-zinc-600"}`}>{s}</p>
            ))}
          </div>
          <Link href="/browse">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white">
              Browse the marketplace while you wait →
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Rejected — can reapply ────────────────────────────────────────────────
  if (appStatus === "rejected") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Application not approved</h2>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Your previous application wasn&apos;t approved. You&apos;re welcome to reapply with a stronger portfolio or more detail.
          </p>
          <Button onClick={() => setAppStatus("none")} className="bg-violet-600 hover:bg-violet-500 text-white">
            Reapply Now
          </Button>
        </div>
      </div>
    );
  }

  // ── Application form ──────────────────────────────────────────────────────
  const TOTAL_STEPS = 4;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/become-a-creator" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm mb-4 transition-colors">
            ← Back to Creator Info
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Creator Application</h1>
          <p className="text-zinc-400 text-sm">Step {step} of {TOTAL_STEPS} — fill in your details and we&apos;ll review within 24 hours.</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-10">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${i < step ? "bg-violet-500" : "bg-zinc-800"}`}
            />
          ))}
        </div>

        {/* ── Step 1: Profile ── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Your Profile</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Display Name *</label>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name or brand" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Username</label>
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-600 text-sm shrink-0">@</span>
                    <input
                      value={username}
                      onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      placeholder="your-username"
                      className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Headline</label>
                <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="e.g. AI prompt engineer & developer tools creator" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself, your expertise, and what you create..." rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none" />
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!displayName.trim()} className="bg-violet-600 hover:bg-violet-500 text-white px-8 disabled:opacity-50">
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Links & Social ── */}
        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="text-zinc-500 hover:text-white transition-colors text-sm">← Back</button>
            </div>
            <h2 className="text-xl font-bold text-white mb-6">Links & Social</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Website</label>
                  <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Portfolio</label>
                  <input value={portfolio} onChange={e => setPortfolio(e.target.value)} placeholder="https://portfolio.com" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">GitHub</label>
                  <div className="flex items-center gap-1"><span className="text-zinc-600 text-sm shrink-0">@</span><input value={githubHandle} onChange={e => setGithubHandle(e.target.value)} placeholder="username" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Twitter / X</label>
                  <div className="flex items-center gap-1"><span className="text-zinc-600 text-sm shrink-0">@</span><input value={twitterHandle} onChange={e => setTwitterHandle(e.target.value)} placeholder="handle" className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" /></div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">LinkedIn</label>
                  <input value={linkedinHandle} onChange={e => setLinkedinHandle(e.target.value)} placeholder="linkedin.com/in/username" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Discord</label>
                  <input value={discordHandle} onChange={e => setDiscordHandle(e.target.value)} placeholder="username#1234" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setStep(3)} className="bg-violet-600 hover:bg-violet-500 text-white px-8">
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Specialties & Experience ── */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(2)} className="text-zinc-500 hover:text-white transition-colors text-sm">← Back</button>
            </div>
            <h2 className="text-xl font-bold text-white mb-6">Your Expertise</h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">Specialties <span className="text-zinc-600 font-normal">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSpecialty(s)}
                      className={`px-3.5 py-1.5 rounded-full text-sm border transition-all ${
                        specialties.includes(s)
                          ? "bg-violet-600 border-violet-600 text-white"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">Experience Level</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map((lvl) => (
                    <button
                      key={lvl.value}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.value)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        experienceLevel === lvl.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <p className={`text-sm font-semibold ${experienceLevel === lvl.value ? "text-violet-300" : "text-white"}`}>{lvl.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{lvl.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setStep(4)} className="bg-violet-600 hover:bg-violet-500 text-white px-8">
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Payout & Terms ── */}
        {step === 4 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(3)} className="text-zinc-500 hover:text-white transition-colors text-sm">← Back</button>
            </div>
            <h2 className="text-xl font-bold text-white mb-6">Payout & Terms</h2>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-sm text-violet-300">
                <strong>You keep 80%</strong> of every sale. PromptVault takes a 20% platform fee covering payments, hosting, support, and marketing.
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-3">Payment Method</label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setPaymentMethod(m.value)}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        paymentMethod === m.value
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                      }`}
                    >
                      <p className={`text-sm font-semibold ${paymentMethod === m.value ? "text-violet-300" : "text-white"}`}>{m.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Payout Email</label>
                <input
                  type="email"
                  value={payoutEmail}
                  onChange={e => setPayoutEmail(e.target.value)}
                  placeholder="your-payout@email.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
                <p className="text-xs text-zinc-500 mt-1.5">This is where we&apos;ll send your earnings.</p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-violet-500 shrink-0"
                />
                <span className="text-sm text-zinc-400">
                  I agree to the{" "}
                  <Link href="/creator-terms" className="text-violet-400 hover:underline">Creator Terms</Link>
                  {" "}and understand the 80/20 revenue split. I confirm that I own the rights to any content I sell.
                </span>
              </label>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={loading || !agreedToTerms || !payoutEmail.trim()}
              className="w-full mt-6 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3.5 text-base rounded-xl disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Application...
                </span>
              ) : "Submit Creator Application →"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
