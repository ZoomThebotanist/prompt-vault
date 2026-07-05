import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import { BuyButton } from "@/components/buy-button";
import { Badge } from "@/components/ui/badge";
import { categoryColors, categoryLabels, formatPrice } from "@/lib/products";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.title} — PromptVault`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link
            href="/"
            className="text-white font-bold text-lg tracking-tight"
          >
            Prompt<span className="text-zinc-400">Vault</span>
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-500 text-sm truncate">{product.title}</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={`text-sm ${categoryColors[product.category]}`}
              >
                {categoryLabels[product.category]}
              </Badge>
              <Badge
                variant="outline"
                className="text-sm text-zinc-400 border-zinc-700"
              >
                {product.difficulty}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold text-white leading-tight">
              {product.title}
            </h1>

            <p className="text-zinc-400 text-lg leading-relaxed">
              {product.description}
            </p>

            {/* Long description */}
            <div className="prose prose-invert max-w-none">
              <div
                className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: product.longDescription.replace(/\n/g, "<br/>") }}
              />
            </div>

            {/* Preview */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide font-medium mb-3">
                Preview (what&apos;s inside)
              </p>
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                {product.previewContent}
              </pre>
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="text-xs text-zinc-600">
                  🔒 Full prompt content delivered to your email immediately
                  after purchase.
                </p>
              </div>
            </div>

            {/* Model support */}
            {product.modelSupport.length > 0 && (
              <div>
                <p className="text-sm text-zinc-500 mb-2">Works with:</p>
                <div className="flex flex-wrap gap-2">
                  {product.modelSupport.map((m) => (
                    <span
                      key={m}
                      className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full border border-zinc-700"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar / Buy box */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-zinc-900 border border-zinc-700 rounded-xl p-6 space-y-5">
              <div>
                <p className="text-4xl font-bold text-white">
                  {formatPrice(product.priceCents)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">One-time purchase</p>
              </div>

              <BuyButton productId={product.id} productSlug={product.slug} />

              <div className="space-y-2.5 text-sm text-zinc-400">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Full prompt delivered to your email instantly</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Commercial use included</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>30-day quality guarantee</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  <span>Tested on {product.modelSupport[0] ?? "Claude & GPT-4"}</span>
                </div>
              </div>

              {product.tags.length > 0 && (
                <div className="pt-2 border-t border-zinc-800">
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
