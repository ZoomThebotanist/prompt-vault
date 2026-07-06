import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Creator — PromptVault",
  description: "Turn your AI knowledge into income. Sell prompts, agents, templates, and more on PromptVault.",
};

const BENEFITS = [
  { icon: "💎", title: "Keep Ownership", desc: "Your IP stays yours. We're just the marketplace." },
  { icon: "⚡", title: "Fast Payouts", desc: "Request payouts anytime. Processed within 48 hours." },
  { icon: "🚫", title: "No Monthly Fees", desc: "Zero subscription costs. We only earn when you do." },
  { icon: "🛒", title: "Built-in Storefront", desc: "Your own public profile page with product gallery." },
  { icon: "🤖", title: "AI Recommendations", desc: "Our engine surfaces your products to the right buyers." },
  { icon: "📊", title: "Analytics Dashboard", desc: "Real-time views, conversions, revenue, and trends." },
  { icon: "🌍", title: "Global Customers", desc: "Reach buyers in 190+ countries via Stripe Checkout." },
  { icon: "📦", title: "Instant Delivery", desc: "Customers get their purchase the moment they pay." },
];

const PRODUCT_TYPES = [
  { icon: "✨", label: "AI Prompts" },
  { icon: "🤖", label: "Claude Skills" },
  { icon: "⚙️", label: "Cursor Rules" },
  { icon: "🔌", label: "MCP Servers" },
  { icon: "🐍", label: "Python Scripts" },
  { icon: "📋", label: "Templates" },
  { icon: "📝", label: "Notion Systems" },
  { icon: "🎨", label: "Design Assets" },
  { icon: "🎮", label: "3D Models" },
  { icon: "🕹️", label: "Games" },
  { icon: "🧩", label: "Plugins" },
  { icon: "⚡", label: "Automations" },
  { icon: "📚", label: "E-books" },
  { icon: "🎓", label: "Courses" },
  { icon: "💾", label: "Downloads" },
  { icon: "💻", label: "Software" },
  { icon: "🔗", label: "APIs" },
  { icon: "📊", label: "Datasets" },
];

const STEPS = [
  { n: "01", title: "Create Account", desc: "Sign up for free in under 60 seconds. No credit card required." },
  { n: "02", title: "Complete Your Profile", desc: "Tell us about your expertise, specialties, and experience level." },
  { n: "03", title: "Upload Your Product", desc: "Add files, images, description, pricing, and tags." },
  { n: "04", title: "Submit for Review", desc: "Our team reviews to ensure quality. Usually within 24 hours." },
  { n: "05", title: "Start Selling", desc: "Go live and start earning. We handle payments, delivery, and taxes." },
];

const TESTIMONIALS = [
  {
    name: "Alex Chen",
    role: "Prompt Engineer",
    avatar: "AC",
    income: "$4,200/mo",
    reviews: 94,
    products: 12,
    color: "from-violet-600 to-purple-600",
    quote: "PromptVault is the only marketplace where my Claude prompts actually sell. The buyer quality is insane.",
  },
  {
    name: "Sarah Kim",
    role: "AI Automation Dev",
    avatar: "SK",
    income: "$8,900/mo",
    reviews: 231,
    products: 7,
    color: "from-fuchsia-600 to-pink-600",
    quote: "I quit my 9-to-5 six months after launching here. The analytics help me understand exactly what's working.",
  },
  {
    name: "Jordan M.",
    role: "Game Dev & Designer",
    avatar: "JM",
    income: "$2,600/mo",
    reviews: 47,
    products: 31,
    color: "from-blue-600 to-cyan-600",
    quote: "Selling Godot templates and design assets was easier than I expected. Payout was in my account next day.",
  },
];

const FAQS = [
  {
    q: "How does the revenue split work?",
    a: "You keep 80% of every sale. PromptVault takes a 20% platform fee which covers payment processing, hosting, support, and marketing.",
  },
  {
    q: "When and how do I get paid?",
    a: "You can request a payout at any time once your balance exceeds $10. We pay via Stripe to your bank account or debit card, typically within 48 hours.",
  },
  {
    q: "What happens if a customer wants a refund?",
    a: "Customers can request refunds within 7 days of purchase for digital products. Approved refunds are deducted from your pending balance.",
  },
  {
    q: "Do I retain ownership of my content?",
    a: "Yes, 100%. Uploading to PromptVault grants us a license to distribute and market your product, but you retain full intellectual property rights.",
  },
  {
    q: "Do I need to handle taxes?",
    a: "PromptVault collects and remits sales tax where required by law. For US creators, we'll issue a 1099-K if you exceed IRS thresholds. You're responsible for your own income taxes.",
  },
  {
    q: "How long does the review process take?",
    a: "Creator applications are typically reviewed within 24–48 hours. Product submissions are reviewed within 24 hours. We'll notify you by email.",
  },
  {
    q: "What license do buyers get?",
    a: "By default, buyers get a personal/commercial use license for the content. You can set custom license terms per product.",
  },
  {
    q: "Can I sell on other platforms too?",
    a: "Yes. There's no exclusivity requirement. Sell wherever you want — we just want to be your best channel.",
  },
];

export default function BecomeACreatorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-fuchsia-900/15 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 py-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-400 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Now accepting creators
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Turn Your Knowledge
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Into Income.
            </span>
          </h1>
          <p className="text-zinc-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Sell prompts, AI agents, templates, code, digital products, e-books, automation systems, designs, and more — to thousands of buyers worldwide.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/onboard"
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 text-base shadow-lg shadow-violet-500/20"
            >
              Become a Creator →
            </Link>
            <a
              href="#how-it-works"
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base border border-zinc-700"
            >
              Learn More
            </a>
          </div>

          {/* Trust bar */}
          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md mx-auto">
            {[
              { v: "80%", l: "Creator earnings" },
              { v: "48h", l: "Payout speed" },
              { v: "$0", l: "Monthly fees" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-3xl font-bold text-white">{s.v}</p>
                <p className="text-xs text-zinc-500 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Why creators choose PromptVault</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">Built for creators, not corporations. Every feature exists to help you earn more.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-xl p-5 transition-colors group">
              <div className="text-3xl mb-3">{b.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1.5 group-hover:text-violet-300 transition-colors">{b.title}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What Can You Sell ─────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">What Can You Sell?</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Any digital product that helps people work smarter with AI. If it&apos;s valuable, we&apos;ll sell it.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {PRODUCT_TYPES.map((p) => (
              <div
                key={p.label}
                className="bg-zinc-900 border border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-800 rounded-xl p-3 text-center transition-all cursor-default group"
              >
                <div className="text-2xl mb-1.5">{p.icon}</div>
                <p className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors leading-tight">{p.label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-600 mt-6">
            Don&apos;t see your category? Apply anyway — we review every application individually.
          </p>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-zinc-800">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-zinc-400">From zero to earning in a matter of hours.</p>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2 hidden sm:block" />
            <div className="space-y-8">
              {STEPS.map((step, i) => (
                <div
                  key={step.n}
                  className={`relative flex items-start gap-6 sm:gap-0 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}>
                    <div
                      className={`bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors ${i % 2 === 0 ? "sm:ml-auto" : ""}`}
                      style={{ maxWidth: "320px" }}
                    >
                      <p className="text-xs text-violet-400 font-mono mb-1">Step {step.n}</p>
                      <h3 className="font-bold text-white mb-1">{step.title}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden sm:flex w-12 shrink-0 items-center justify-center relative z-10">
                    <div className="w-10 h-10 rounded-full bg-violet-600 border-4 border-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </div>
                  </div>

                  <div className="flex-1 hidden sm:block" />
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-14">
            <Link
              href="/onboard"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-violet-500/20"
            >
              Start Your Application →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">What creators are saying</h2>
            <p className="text-zinc-400">Real results from real people who decided to start.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-colors flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed italic flex-1 mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="grid grid-cols-3 gap-2 border-t border-zinc-800 pt-4">
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-400">{t.income}</p>
                    <p className="text-xs text-zinc-600">income</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{t.reviews}</p>
                    <p className="text-xs text-zinc-600">reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">{t.products}</p>
                    <p className="text-xs text-zinc-600">products</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Frequently asked questions</h2>
            <p className="text-zinc-400">Everything you need to know before applying.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="bg-zinc-900 border border-zinc-800 rounded-xl group overflow-hidden"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-zinc-800/50 transition-colors">
                  <span className="font-medium text-white text-sm pr-4">{faq.q}</span>
                  <span className="text-zinc-400 shrink-0 group-open:rotate-45 transition-transform duration-200 text-lg leading-none">+</span>
                </summary>
                <div className="px-5 pb-4 pt-0">
                  <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="border-t border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-sm text-violet-400 mb-6">
            Free to join · No monthly fees · Instant setup
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to start earning?
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
            Join thousands of creators already selling on PromptVault. Apply today and be live in 24 hours.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/onboard"
              className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-10 py-4 rounded-xl transition-all hover:scale-105 text-lg shadow-xl shadow-violet-500/20"
            >
              Apply Now — It&apos;s Free
            </Link>
            <Link
              href="/browse"
              className="text-zinc-400 hover:text-white font-medium text-base transition-colors"
            >
              Browse the marketplace →
            </Link>
          </div>
          <p className="mt-6 text-xs text-zinc-600">
            Reviewed within 24–48 hours. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <Link href="/" className="text-white font-bold">
            Prompt<span className="text-violet-400">Vault</span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-zinc-500">
            <Link href="/browse" className="hover:text-zinc-300 transition-colors">Browse</Link>
            <Link href="/onboard" className="hover:text-zinc-300 transition-colors">Apply</Link>
            <Link href="/login" className="hover:text-zinc-300 transition-colors">Sign In</Link>
            <a href="mailto:support@promptvault.dev" className="hover:text-zinc-300 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
