import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description").notNull(),
  category: text("category").notNull(), // 'developer-tools' | 'game-dev' | 'marketing'
  priceCents: integer("price_cents").notNull(),
  stripePriceId: text("stripe_price_id"),
  stripeProductId: text("stripe_product_id"),
  fileContent: text("file_content").notNull(), // full prompt delivered on purchase
  previewContent: text("preview_content").notNull(), // teaser shown before buy
  tags: text("tags").array().notNull().default([]),
  difficulty: text("difficulty").notNull().default("intermediate"),
  modelSupport: text("model_support").array().notNull().default([]),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id),
  customerEmail: text("customer_email").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeSessionId: text("stripe_session_id").unique(),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
