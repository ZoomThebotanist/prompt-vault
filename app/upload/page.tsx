"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PricingType = "free" | "paid" | "pwyw";
type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

const CATEGORIES = [
  { value: "developer-tools", label: "Developer Tools" },
  { value: "game-dev", label: "Game Development" },
  { value: "marketing", label: "Marketing & Copywriting" },
  { value: "design", label: "Design & Creative" },
  { value: "business", label: "Business & Strategy" },
  { value: "education", label: "Education & Learning" },
  { value: "productivity", label: "Productivity" },
  { value: "writing", label: "Writing & Content" },
  { value: "data-analysis", label: "Data & Analysis" },
  { value: "research", label: "Research" },
  { value: "customer-service", label: "Customer Service" },
  { value: "legal", label: "Legal & Compliance" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hr", label: "HR & Recruiting" },
  { value: "general", label: "General Purpose" },
];

const MODELS = ["Claude", "GPT-4o", "GPT-4", "Gemini Pro", "Mistral", "Llama 3", "GPT-3.5", "Gemini Flash"];

const STEPS = [
  { id: 1, label: "Basics" },
  { id: 2, label: "Content" },
  { id: 3, label: "Pricing" },
  { id: 4, label: "Preview" },
  { id: 5, label: "SEO" },
  { id: 6, label: "Publish" },
];

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function UploadPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basics
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Step 2: Content
  const [fullContent, setFullContent] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [models, setModels] = useState<string[]>(["Claude", "GPT-4o"]);

  // Step 3: Pricing
  const [pricingType, setPricingType] = useState<PricingType>("paid");
  const [price, setPrice] = useState("9");
  const [minPrice, setMinPrice] = useState("1");

  // Step 4: Preview
  const [coverUrl, setCoverUrl] = useState("");
  const [demoOutput, setDemoOutput] = useState("");
  const [useCases, setUseCases] = useState("");

  // Step 5: SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [slug, setSlug] = useState("");

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Sign in to upload prompts.</p>
          <Link href="/login?callbackUrl=/upload"><Button className="bg-violet-600 hover:bg-violet-500 text-white">Sign In</Button></Link>
        </div>
      </div>
    );
  }

  if (session.user.role !== "creator" && session.user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">You need a creator account to upload prompts.</p>
          <Link href="/onboard"><Button className="bg-violet-600 hover:bg-violet-500 text-white">Become a Creator</Button></Link>
        </div>
      </div>
    );
  }

  function addTag(e: React.KeyboardEvent) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().toLowerCase().replace(/,/g, "");
      if (!tags.includes(t) && tags.length < 10) setTags([...tags, t]);
      setTagInput("");
    }
  }

  function toggleModel(m: string) {
    setModels(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  function autoFillSEO() {
    if (!seoTitle) setSeoTitle(title);
    if (!seoDesc) setSeoDesc(description);
    if (!slug) setSlug(generateSlug(title));
  }

  const canAdvance = {
    1: title.trim().length > 3 && description.trim().length > 20,
    2: fullContent.trim().length > 50 && previewContent.trim().length > 20,
    3: pricingType === "free" || (pricingType === "paid" && parseFloat(price) >= 1) || pricingType === "pwyw",
    4: true,
    5: slug.trim().length > 0,
    6: true,
  };

  async function handlePublish() {
    setLoading(true);
    setError("");
    try {
      const priceCents = pricingType === "free" ? 0 : Math.round(parseFloat(price) * 100);
      const minPriceCents = pricingType === "pwyw" ? Math.round(parseFloat(minPrice) * 100) : null;

      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          description: description.trim(),
          longDescription: description.trim(),
          category,
          tags,
          fullContent: fullContent.trim(),
          previewContent: previewContent.trim(),
          difficulty,
          modelSupport: models,
          pricingType,
          priceCents,
          minPriceCents,
          slug: slug.trim() || generateSlug(title),
          seoTitle: seoTitle.trim() || title.trim(),
          seoDescription: seoDesc.trim() || description.trim(),
          coverImageUrl: coverUrl.trim() || null,
          demoOutput: demoOutput.trim() || null,
          useCases: useCases.split("\n").map(s => s.trim()).filter(Boolean),
          status: "pending",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to publish."); }
      else { router.push(`/dashboard/prompts?published=1`); }
    } catch { setError("Something went wrong."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Upload a Prompt</h1>
          <p className="text-zinc-400 text-sm mt-1">Follow the steps to publish your prompt to the marketplace.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button
                onClick={() => step > s.id || canAdvance[s.id as keyof typeof canAdvance] ? setStep(s.id) : null}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  step === s.id ? "bg-violet-600 text-white" : step > s.id ? "bg-zinc-800 text-zinc-300" : "text-zinc-600"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step === s.id ? "bg-violet-500 text-white" : step > s.id ? "bg-emerald-600 text-white" : "bg-zinc-700 text-zinc-500"}`}>
                  {step > s.id ? "✓" : s.id}
                </span>
                {s.label}
              </button>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-zinc-700 mx-1" />}
            </div>
          ))}
        </div>

        {error && <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>}

        {/* Step content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

          {/* ── Step 1: Basics ── */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title *</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Full-Stack Code Review System for Claude" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Subtitle</label>
                <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="One-line hook about what makes this great" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description * <span className="text-zinc-500 font-normal">(shown on listing cards)</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What does this prompt do? Who is it for? What problem does it solve?" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                <p className="text-xs text-zinc-600 mt-1">{description.length}/500 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Category *</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Tags <span className="text-zinc-500 font-normal">(press Enter to add, max 10)</span></label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded-full">
                      {t}
                      <button onClick={() => setTags(tags.filter(x => x !== t))} className="text-zinc-500 hover:text-red-400">×</button>
                    </span>
                  ))}
                </div>
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Add tags..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
            </div>
          )}

          {/* ── Step 2: Content ── */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Prompt Content</h2>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full Prompt * <span className="text-zinc-500 font-normal">(delivered to buyers)</span></label>
                <textarea value={fullContent} onChange={e => setFullContent(e.target.value)} rows={12} placeholder="Write your full prompt here. Use [VARIABLE] syntax for customizable parts..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors resize-y" />
                <p className="text-xs text-zinc-600 mt-1">~{Math.round(fullContent.split(/\s+/).filter(Boolean).length * 1.33)} tokens</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Preview <span className="text-zinc-500 font-normal">(teaser shown before purchase)</span></label>
                <textarea value={previewContent} onChange={e => setPreviewContent(e.target.value)} rows={5} placeholder="Show just enough to hook buyers — don't give away the full prompt..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Difficulty</label>
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Supported Models</label>
                  <div className="flex flex-wrap gap-2">
                    {MODELS.map(m => (
                      <button key={m} onClick={() => toggleModel(m)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${models.includes(m) ? "bg-violet-600/20 border-violet-500 text-violet-300" : "bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-500"}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Pricing ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Pricing</h2>
              <div className="grid grid-cols-3 gap-3">
                {(["free", "paid", "pwyw"] as PricingType[]).map(pt => (
                  <button
                    key={pt}
                    onClick={() => setPricingType(pt)}
                    className={`p-4 rounded-xl border text-left transition-colors ${pricingType === pt ? "bg-violet-600/20 border-violet-500" : "bg-zinc-800 border-zinc-700 hover:border-zinc-500"}`}
                  >
                    <div className="font-medium text-white capitalize mb-1">
                      {pt === "pwyw" ? "Pay What You Want" : pt === "free" ? "Free" : "Paid"}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {pt === "free" ? "Maximum exposure, zero revenue" : pt === "paid" ? "Fixed price, predictable income" : "Let buyers choose their price"}
                    </div>
                  </button>
                ))}
              </div>

              {pricingType === "paid" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                    <input type="number" min="1" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5">You earn ${(parseFloat(price || "0") * 0.8).toFixed(2)} per sale after 20% platform fee.</p>
                </div>
              )}

              {pricingType === "pwyw" && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Minimum Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                    <input type="number" min="0" step="0.01" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1.5">Set to $0 to let buyers pay as little as they want.</p>
                </div>
              )}

              <div className="bg-zinc-800 rounded-lg p-4 text-sm text-zinc-400">
                <strong className="text-white">Suggested pricing:</strong>
                <ul className="mt-2 space-y-1">
                  <li>Simple utility prompts: $3 – $7</li>
                  <li>Full prompt systems: $9 – $19</li>
                  <li>Comprehensive frameworks: $24 – $49</li>
                  <li>Enterprise-grade systems: $49 – $99</li>
                </ul>
              </div>
            </div>
          )}

          {/* ── Step 4: Preview ── */}
          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Preview & Examples</h2>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Cover Image URL <span className="text-zinc-500 font-normal">(optional)</span></label>
                <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                <p className="text-xs text-zinc-500 mt-1">Recommended: 1200×630px. Prompts with cover images get 3× more clicks.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Demo Output Example <span className="text-zinc-500 font-normal">(optional but recommended)</span></label>
                <textarea value={demoOutput} onChange={e => setDemoOutput(e.target.value)} rows={6} placeholder="Paste a real output example from using your prompt..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-violet-500 transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Use Cases <span className="text-zinc-500 font-normal">(one per line)</span></label>
                <textarea value={useCases} onChange={e => setUseCases(e.target.value)} rows={4} placeholder={`Automated code review for pull requests\nExplaining legacy code to new developers\nGenerating documentation from source code`} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none" />
              </div>
            </div>
          )}

          {/* ── Step 5: SEO ── */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">SEO & Discovery</h2>
                <button onClick={autoFillSEO} className="text-xs text-violet-400 hover:text-violet-300 underline">Auto-fill from basics</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">URL Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-sm shrink-0">promptvault.dev/p/</span>
                  <input value={slug} onChange={e => setSlug(generateSlug(e.target.value))} placeholder={generateSlug(title) || "my-awesome-prompt"} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Title</label>
                <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={title} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors" />
                <p className="text-xs text-zinc-600 mt-1">{seoTitle.length}/60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Meta Description</label>
                <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} rows={3} placeholder={description.slice(0, 160)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none" />
                <p className="text-xs text-zinc-600 mt-1">{seoDesc.length}/160 characters</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Search Preview</p>
                <div className="space-y-0.5">
                  <p className="text-blue-400 text-sm">{seoTitle || title || "Prompt Title"}</p>
                  <p className="text-emerald-500 text-xs">promptvault.dev/p/{slug || "my-prompt"}</p>
                  <p className="text-zinc-400 text-xs leading-relaxed">{(seoDesc || description).slice(0, 160)}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 6: Publish ── */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Review & Publish</h2>
              <div className="space-y-3">
                {[
                  { label: "Title", value: title, ok: title.trim().length > 3 },
                  { label: "Description", value: `${description.length} characters`, ok: description.trim().length > 20 },
                  { label: "Full Content", value: `~${Math.round(fullContent.split(/\s+/).filter(Boolean).length * 1.33)} tokens`, ok: fullContent.trim().length > 50 },
                  { label: "Preview", value: `${previewContent.length} characters`, ok: previewContent.trim().length > 20 },
                  { label: "Category", value: CATEGORIES.find(c => c.value === category)?.label ?? category, ok: true },
                  { label: "Pricing", value: pricingType === "free" ? "Free" : pricingType === "pwyw" ? `PWYW (min $${minPrice})` : `$${price}`, ok: true },
                  { label: "URL Slug", value: `promptvault.dev/p/${slug}`, ok: slug.trim().length > 0 },
                  { label: "Models", value: models.join(", ") || "None selected", ok: models.length > 0 },
                ].map(({ label, value, ok }) => (
                  <div key={label} className="flex items-start justify-between py-2 border-b border-zinc-800 last:border-0">
                    <span className="text-sm text-zinc-400">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-300 text-right max-w-xs truncate">{value}</span>
                      <span className={ok ? "text-emerald-400" : "text-red-400"}>{ok ? "✓" : "✗"}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-sm text-amber-300">
                Your prompt will be reviewed by our team before going live. This usually takes 24–48 hours.
                You&apos;ll receive an email notification when it&apos;s approved.
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            className="text-zinc-400 hover:text-white disabled:opacity-0"
          >
            ← Back
          </Button>

          {step < 6 ? (
            <Button
              onClick={() => { if (step === 5) autoFillSEO(); setStep(s => s + 1); }}
              disabled={!canAdvance[step as keyof typeof canAdvance]}
              className="bg-violet-600 hover:bg-violet-500 text-white px-6 disabled:opacity-50"
            >
              Continue →
            </Button>
          ) : (
            <Button
              onClick={handlePublish}
              disabled={loading || !slug.trim()}
              className="bg-violet-600 hover:bg-violet-500 text-white px-8 font-semibold disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit for Review →"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
