import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <span className="text-3xl">✓</span>
        </div>
        <h1 className="text-3xl font-bold text-white">You&apos;re all set!</h1>
        <p className="text-zinc-400 text-lg">
          Your prompt has been sent to your email. Check your inbox (and spam
          just in case).
        </p>
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5 text-left space-y-3">
          <p className="text-sm font-medium text-white">What to do next:</p>
          <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
            <li>Open the email from delivery@promptvault.dev</li>
            <li>Copy the full prompt content</li>
            <li>Paste into Claude, ChatGPT, or your AI tool</li>
            <li>Replace [PLACEHOLDER] variables with your specifics</li>
            <li>Get results 10x faster than before</li>
          </ol>
        </div>
        <Link
          href="/"
          className="block w-full py-3 bg-white text-black text-base font-semibold rounded-lg hover:bg-zinc-200 transition-colors text-center"
        >
          Browse More Prompts →
        </Link>
        <p className="text-xs text-zinc-600">
          Questions? Email{" "}
          <a href="mailto:support@promptvault.dev" className="text-zinc-400">
            support@promptvault.dev
          </a>
        </p>
      </div>
    </div>
  );
}
