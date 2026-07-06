"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { doResetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle, ShieldCheck } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Invalid reset link</h2>
        <p className="text-zinc-400 text-sm">This link is missing a token. Please request a new one.</p>
        <Link href="/forgot-password" className="inline-block mt-4 text-violet-400 hover:text-violet-300 text-sm">
          Request new reset link →
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await doResetPassword({ newPassword: password, token });
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Failed to reset password. The link may have expired — request a new one.");
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : password.length < 12 ? 3 : 4;
  const strengthColors = ["bg-zinc-700", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-400"];

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Password updated!</h2>
        <p className="text-zinc-400 text-sm">Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
          {error.includes("expired") && (
            <Link href="/forgot-password" className="block mt-1 text-violet-400 hover:text-violet-300 underline">
              Request new link →
            </Link>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">New password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="At least 8 characters"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && (
          <div className="mt-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${strength >= i ? strengthColors[strength] : "bg-zinc-700"}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Confirm new password</label>
        <input
          type={showPassword ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          placeholder="Repeat your password"
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
            Updating...
          </span>
        ) : "Set New Password"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white">
            Prompt<span className="text-violet-400">Vault</span>
          </Link>
          <p className="mt-2 text-zinc-400 text-sm">Choose a new password</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <Suspense fallback={<div className="h-32 animate-pulse bg-zinc-800 rounded-lg" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p className="text-center mt-6 text-sm text-zinc-500">
          Remember it?{" "}
          <Link href="/login" className="text-violet-400 hover:text-violet-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
