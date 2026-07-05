import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getAllProducts() {
  return db.select().from(products).where(eq(products.published, true));
}

export async function getProductsByCategory(category: string) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.published, true), eq(products.category, category)));
}

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.published, true)))
    .limit(1);
  return rows[0] ?? null;
}

export const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "developer-tools", label: "Developer Tools" },
  { value: "game-dev", label: "Game Dev" },
  { value: "marketing", label: "Marketing" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export const categoryColors: Record<string, string> = {
  "developer-tools": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "game-dev": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "marketing": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

export const categoryLabels: Record<string, string> = {
  "developer-tools": "Developer Tools",
  "game-dev": "Game Dev",
  "marketing": "Marketing",
};
