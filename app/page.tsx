import { Suspense } from "react";
import { getAllProducts, getProductsByCategory } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { CategoryFilter } from "@/components/category-filter";

interface HomeProps {
  searchParams: Promise<{ category?: string }>;
}

export const revalidate = 60;

async function ProductGrid({ category }: { category: string }) {
  const products =
    category === "all" || !category
      ? await getAllProducts()
      : await getProductsByCategory(category);

  if (products.length === 0) {
    return (
      <div className="col-span-full text-center py-16 text-zinc-500">
        No products in this category yet. Check back soon.
      </div>
    );
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </>
  );
}

export default async function HomePage({ searchParams }: HomeProps) {
  const { category = "all" } = await searchParams;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Nav */}
      <nav className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-white font-bold text-lg tracking-tight">
            Prompt<span className="text-zinc-400">Vault</span>
          </span>
          <span className="text-xs text-zinc-500">
            Professional AI Prompt Systems
          </span>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-full px-4 py-1.5 text-xs text-zinc-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Battle-tested prompt systems — not generic templates
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Stop getting mediocre AI outputs.
          <br />
          <span className="text-zinc-400">Buy expert-engineered prompt systems.</span>
        </h1>
        <p className="mt-5 text-zinc-400 text-lg max-w-xl mx-auto">
          Every product is tested across 20+ real-world inputs. What took hours
          of iteration is ready to use immediately.
        </p>

        {/* Before/After callout */}
        <div className="mt-10 grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mb-2">
              ❌ Without PromptVault
            </p>
            <p className="text-sm text-zinc-400">
              &ldquo;Write me a Godot script for an enemy AI&rdquo;
            </p>
            <p className="text-xs text-zinc-600 mt-2 italic">
              → Generic, buggy, off-pattern code. 45 minutes of cleanup.
            </p>
          </div>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide mb-2">
              ✓ With PromptVault
            </p>
            <p className="text-sm text-zinc-300">
              Structured Godot 4 AI framework with state machine, signals,
              nav agent, and your project patterns pre-encoded.
            </p>
            <p className="text-xs text-emerald-600 mt-2">
              → Production-ready output. First try.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Browse Products</h2>
        </div>

        <div className="mb-6">
          <Suspense>
            <CategoryFilter active={category} />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Suspense
            fallback={
              <div className="col-span-3 text-center py-16 text-zinc-500">
                Loading products...
              </div>
            }
          >
            <ProductGrid category={category} />
          </Suspense>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-zinc-600 text-sm">
        <p>
          PromptVault &mdash; Professional AI Prompt Systems &mdash;{" "}
          <a
            href="mailto:support@promptvault.dev"
            className="hover:text-zinc-400 transition-colors"
          >
            support@promptvault.dev
          </a>
        </p>
      </footer>
    </div>
  );
}
