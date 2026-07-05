import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { categoryColors, categoryLabels, formatPrice } from "@/lib/products";
import type { Product } from "@/db/schema";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="flex flex-col bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant="outline"
            className={`text-xs font-medium ${categoryColors[product.category]}`}
          >
            {categoryLabels[product.category]}
          </Badge>
          <Badge variant="outline" className="text-xs text-zinc-400 border-zinc-700">
            {product.difficulty}
          </Badge>
        </div>
        <h3 className="text-base font-semibold text-white leading-snug mt-2">
          {product.title}
        </h3>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-zinc-400 leading-relaxed">{product.description}</p>
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex items-center justify-between">
        <span className="text-xl font-bold text-white">{formatPrice(product.priceCents)}</span>
        <Link
          href={`/products/${product.slug}`}
          className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
        >
          View →
        </Link>
      </CardFooter>
    </Card>
  );
}
