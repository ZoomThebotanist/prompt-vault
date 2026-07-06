"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      // Always show success — don't reveal if email exists
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white">
            Prompt<span className="text-violet-400">Vault</span>
          </Link>
          <p className="mt-2 text-zinc-400 text-sm">Reset your password</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                If <span className="text-white font-medium">{email}</span> has an account, we&apos;ve sent a reset link. It expires in 1 hour.
              </p>
              <p className="text-zinc-600 text-xs mt-4">Didn&apos;t receive it? Check spam or try again.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-violet-400" />
                </div>
                <p className="text-sm text-zinc-400">
                  Enter your account email and we&apos;ll send you a reset link.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-2.5 rounded-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
