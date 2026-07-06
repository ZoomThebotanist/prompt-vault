import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Better Auth Required Tables ───────────────────────────────────────────

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // Extended marketplace fields
  username: text("username").unique(),
  bio: text("bio"),
  website: text("website"),
  twitterHandle: text("twitter_handle"),
  role: text("role").notNull().default("buyer"), // buyer | creator | admin
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── Creator Profiles ──────────────────────────────────────────────────────

export const creatorProfiles = pgTable("creator_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique().references(() => user.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  headline: text("headline"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  bannerUrl: text("banner_url"),
  website: text("website"),
  twitterHandle: text("twitter_handle"),
  githubHandle: text("github_handle"),
  youtubeHandle: text("youtube_handle"),
  verified: boolean("verified").notNull().default(false),
  featuredUntil: timestamp("featured_until"),
  // Financials
  stripeConnectId: text("stripe_connect_id"),
  payoutEmail: text("payout_email"),
  totalEarningsCents: integer("total_earnings_cents").notNull().default(0),
  pendingPayoutCents: integer("pending_payout_cents").notNull().default(0),
  // Stats (denormalized for performance)
  totalSales: integer("total_sales").notNull().default(0),
  totalRevenueCents: integer("total_revenue_cents").notNull().default(0),
  followerCount: integer("follower_count").notNull().default(0),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }),
  // Onboarding
  onboardedAt: timestamp("onboarded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Categories ────────────────────────────────────────────────────────────

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  parentId: uuid("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Tags ──────────────────────────────────────────────────────────────────

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  usageCount: integer("usage_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Prompts (core listing) ────────────────────────────────────────────────

export const prompts = pgTable(
  "prompts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: text("creator_id").notNull().references(() => user.id),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description").notNull(),
    longDescription: text("long_description").notNull(),
    categoryId: uuid("category_id").references(() => categories.id),
    // Legacy category support
    category: text("category").notNull().default("general"),
    // Pricing
    pricingType: text("pricing_type").notNull().default("paid"), // free | paid | pwyw | subscription
    priceCents: integer("price_cents").notNull().default(0),
    minPriceCents: integer("min_price_cents"), // for PWYW
    stripePriceId: text("stripe_price_id"),
    stripeProductId: text("stripe_product_id"),
    // Content
    fullContent: text("full_content").notNull(),
    previewContent: text("preview_content").notNull(),
    // Metadata
    difficulty: text("difficulty").notNull().default("intermediate"),
    modelSupport: text("model_support").array().notNull().default([]),
    useCases: text("use_cases").array().notNull().default([]),
    industries: text("industries").array().notNull().default([]),
    estimatedTimeSavedMinutes: integer("estimated_time_saved_minutes"),
    promptLengthTokens: integer("prompt_length_tokens"),
    // Media
    coverImageUrl: text("cover_image_url"),
    previewImageUrls: text("preview_image_urls").array().notNull().default([]),
    demoOutputUrl: text("demo_output_url"),
    // SEO
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    seoKeywords: text("seo_keywords").array().notNull().default([]),
    ogImageUrl: text("og_image_url"),
    // Status
    status: text("status").notNull().default("draft"), // draft | pending | published | rejected | archived
    publishedAt: timestamp("published_at"),
    rejectionReason: text("rejection_reason"),
    featuredUntil: timestamp("featured_until"),
    // Stats (denormalized)
    salesCount: integer("sales_count").notNull().default(0),
    downloadCount: integer("download_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    wishlistCount: integer("wishlist_count").notNull().default(0),
    avgRating: decimal("avg_rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count").notNull().default(0),
    // Version
    currentVersion: text("current_version").notNull().default("1.0.0"),
    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("prompts_creator_idx").on(t.creatorId), index("prompts_status_idx").on(t.status)]
);

export const promptTags = pgTable(
  "prompt_tags",
  {
    promptId: uuid("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.promptId, t.tagId] })]
);

export const promptVersions = pgTable("prompt_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  promptId: uuid("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
  version: text("version").notNull(),
  fullContent: text("full_content").notNull(),
  changeNotes: text("change_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Legacy products table (keep for backward compat with existing data) ───

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description").notNull(),
  category: text("category").notNull(),
  priceCents: integer("price_cents").notNull(),
  stripePriceId: text("stripe_price_id"),
  stripeProductId: text("stripe_product_id"),
  fileContent: text("file_content").notNull(),
  previewContent: text("preview_content").notNull(),
  tags: text("tags").array().notNull().default([]),
  difficulty: text("difficulty").notNull().default("intermediate"),
  modelSupport: text("model_support").array().notNull().default([]),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Purchases / Orders ────────────────────────────────────────────────────

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promptId: uuid("prompt_id").references(() => prompts.id),
    productId: uuid("product_id").references(() => products.id), // legacy
    buyerId: text("buyer_id").references(() => user.id),
    creatorId: text("creator_id").references(() => user.id),
    customerEmail: text("customer_email").notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    stripeSessionId: text("stripe_session_id").unique(),
    amountCents: integer("amount_cents").notNull().default(0),
    platformFeeCents: integer("platform_fee_cents").notNull().default(0),
    creatorEarningsCents: integer("creator_earnings_cents").notNull().default(0),
    currency: text("currency").notNull().default("usd"),
    couponId: uuid("coupon_id"),
    deliveredAt: timestamp("delivered_at"),
    refundedAt: timestamp("refunded_at"),
    refundReason: text("refund_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("purchases_buyer_idx").on(t.buyerId), index("purchases_creator_idx").on(t.creatorId)]
);

// ─── Coupons ───────────────────────────────────────────────────────────────

export const coupons = pgTable("coupons", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: text("creator_id").notNull().references(() => user.id),
  code: text("code").notNull().unique(),
  type: text("type").notNull().default("percentage"), // percentage | fixed
  discountPercent: integer("discount_percent"),
  discountCents: integer("discount_cents"),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  minPurchaseCents: integer("min_purchase_cents"),
  expiresAt: timestamp("expires_at"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Reviews ───────────────────────────────────────────────────────────────

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promptId: uuid("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
    reviewerId: text("reviewer_id").notNull().references(() => user.id),
    purchaseId: uuid("purchase_id").references(() => purchases.id),
    rating: integer("rating").notNull(), // 1-5
    title: text("title"),
    body: text("body"),
    imageUrls: text("image_urls").array().notNull().default([]),
    helpfulCount: integer("helpful_count").notNull().default(0),
    creatorReply: text("creator_reply"),
    creatorRepliedAt: timestamp("creator_replied_at"),
    moderationStatus: text("moderation_status").notNull().default("approved"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("reviews_prompt_idx").on(t.promptId),
    uniqueIndex("reviews_purchase_unique").on(t.purchaseId),
  ]
);

export const reviewVotes = pgTable(
  "review_votes",
  {
    reviewId: uuid("review_id").notNull().references(() => reviews.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    helpful: boolean("helpful").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.reviewId, t.userId] })]
);

// ─── Wishlists ─────────────────────────────────────────────────────────────

export const wishlists = pgTable(
  "wishlists",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    promptId: uuid("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.promptId] })]
);

// ─── Follows ───────────────────────────────────────────────────────────────

export const follows = pgTable(
  "follows",
  {
    followerId: text("follower_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    creatorId: text("creator_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.creatorId] })]
);

// ─── Collections ───────────────────────────────────────────────────────────

export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const collectionPrompts = pgTable(
  "collection_prompts",
  {
    collectionId: uuid("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
    promptId: uuid("prompt_id").notNull().references(() => prompts.id, { onDelete: "cascade" }),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.collectionId, t.promptId] })]
);

// ─── Notifications ─────────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // purchase | review | follow | reply | payout | featured | update
    title: text("title").notNull(),
    body: text("body"),
    actionUrl: text("action_url"),
    read: boolean("read").notNull().default(false),
    data: text("data"), // JSON blob
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("notifs_user_idx").on(t.userId)]
);

// ─── Reports ───────────────────────────────────────────────────────────────

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporterId: text("reporter_id").notNull().references(() => user.id),
  targetType: text("target_type").notNull(), // prompt | review | user
  targetId: text("target_id").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").notNull().default("open"), // open | resolved | dismissed
  resolvedBy: text("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Payouts ───────────────────────────────────────────────────────────────

export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: text("creator_id").notNull().references(() => user.id),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull().default("pending"), // pending | processing | completed | failed
  stripeTransferId: text("stripe_transfer_id"),
  notes: text("notes"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Analytics Events ──────────────────────────────────────────────────────

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promptId: uuid("prompt_id").references(() => prompts.id, { onDelete: "cascade" }),
    creatorId: text("creator_id").references(() => user.id),
    eventType: text("event_type").notNull(), // view | impression | click | purchase | wishlist
    sessionId: text("session_id"),
    referrer: text("referrer"),
    country: text("country"),
    device: text("device"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("analytics_prompt_idx").on(t.promptId), index("analytics_creator_idx").on(t.creatorId)]
);

// ─── Achievements ──────────────────────────────────────────────────────────

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull().default(0),
  condition: text("condition").notNull(), // JSON condition spec
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    achievementId: text("achievement_id").notNull().references(() => achievements.id),
    earnedAt: timestamp("earned_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.achievementId] })]
);

// ─── Relations ─────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  creatorProfile: one(creatorProfiles, { fields: [user.id], references: [creatorProfiles.userId] }),
  prompts: many(prompts),
  purchases: many(purchases, { relationName: "buyer" }),
  sales: many(purchases, { relationName: "creator" }),
  reviews: many(reviews),
  wishlists: many(wishlists),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "creator" }),
  collections: many(collections),
  notifications: many(notifications),
}));

export const promptRelations = relations(prompts, ({ one, many }) => ({
  creator: one(user, { fields: [prompts.creatorId], references: [user.id] }),
  category: one(categories, { fields: [prompts.categoryId], references: [categories.id] }),
  tags: many(promptTags),
  versions: many(promptVersions),
  purchases: many(purchases),
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const purchaseRelations = relations(purchases, ({ one }) => ({
  prompt: one(prompts, { fields: [purchases.promptId], references: [prompts.id] }),
  buyer: one(user, { fields: [purchases.buyerId], references: [user.id], relationName: "buyer" }),
  creator: one(user, { fields: [purchases.creatorId], references: [user.id], relationName: "creator" }),
  review: one(reviews, { fields: [purchases.id], references: [reviews.purchaseId] }),
  coupon: one(coupons, { fields: [purchases.couponId], references: [coupons.id] }),
}));

export const reviewRelations = relations(reviews, ({ one, many }) => ({
  prompt: one(prompts, { fields: [reviews.promptId], references: [prompts.id] }),
  reviewer: one(user, { fields: [reviews.reviewerId], references: [user.id] }),
  votes: many(reviewVotes),
}));

export const creatorProfileRelations = relations(creatorProfiles, ({ one }) => ({
  user: one(user, { fields: [creatorProfiles.userId], references: [user.id] }),
}));

// ─── Types ─────────────────────────────────────────────────────────────────

export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type Prompt = typeof prompts.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Payout = typeof payouts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Tag = typeof tags.$inferSelect;
export type Collection = typeof collections.$inferSelect;

// ─── Publisher: Platform Accounts ─────────────────────────────────────────────

export const publisherAccounts = pgTable(
  "publisher_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(), // x | reddit | linkedin | instagram | facebook | tiktok | youtube | bluesky | threads | pinterest
    accountHandle: text("account_handle").notNull(),
    accountName: text("account_name"),
    avatarUrl: text("avatar_url"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at"),
    scopes: text("scopes").array().notNull().default([]),
    isActive: boolean("is_active").notNull().default(true),
    metadata: text("metadata"), // JSON
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("pub_accounts_user_idx").on(t.userId),
    uniqueIndex("pub_accounts_unique").on(t.userId, t.platform, t.accountHandle),
  ]
);

// ─── Publisher: Campaigns ──────────────────────────────────────────────────────

export const publisherCampaigns = pgTable(
  "publisher_campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    status: text("status").notNull().default("active"), // active | paused | completed | archived
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("pub_campaigns_user_idx").on(t.userId)]
);

// ─── Publisher: Posts ──────────────────────────────────────────────────────────

export const publisherPosts = pgTable(
  "publisher_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    campaignId: uuid("campaign_id").references(() => publisherCampaigns.id),

    // Canonical content
    title: text("title"),
    description: text("description"),
    hashtags: text("hashtags").array().notNull().default([]),
    link: text("link"),
    mediaUrls: text("media_urls").array().notNull().default([]),

    // Scheduling
    scheduledAt: timestamp("scheduled_at"),
    timezone: text("timezone").notNull().default("UTC"),

    // Status lifecycle
    // draft | waiting | queued | publishing | published | partial | failed | retrying | cancelled | archived
    status: text("status").notNull().default("draft"),

    // Dedup
    contentHash: text("content_hash"),

    // Source
    source: text("source").notNull().default("manual"), // manual | agent | api

    priority: integer("priority").notNull().default(5), // 1=highest, 10=lowest

    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("pub_posts_user_idx").on(t.userId),
    index("pub_posts_status_idx").on(t.status),
    index("pub_posts_scheduled_idx").on(t.scheduledAt),
  ]
);

// ─── Publisher: Per-platform post variants ────────────────────────────────────

export const publisherPostPlatforms = pgTable(
  "publisher_post_platforms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id").notNull().references(() => publisherPosts.id, { onDelete: "cascade" }),
    accountId: uuid("account_id").notNull().references(() => publisherAccounts.id),
    platform: text("platform").notNull(),

    // Platform-specific content overrides
    customText: text("custom_text"),
    customHashtags: text("custom_hashtags").array().notNull().default([]),
    platformPayload: text("platform_payload"), // JSON — final transformed payload

    // Result
    status: text("status").notNull().default("pending"),
    // pending | publishing | published | failed | retrying | cancelled
    platformPostId: text("platform_post_id"),
    publishedUrl: text("published_url"),
    publishedAt: timestamp("published_at"),
    errorMessage: text("error_message"),
    errorType: text("error_type"),
    attempts: integer("attempts").notNull().default(0),
    nextRetryAt: timestamp("next_retry_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("pub_post_platforms_post_idx").on(t.postId),
    index("pub_post_platforms_status_idx").on(t.status),
  ]
);

// ─── Publisher: Immutable publish log ─────────────────────────────────────────

export const publishLogs = pgTable(
  "publish_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postPlatformId: uuid("post_platform_id").notNull().references(() => publisherPostPlatforms.id),
    attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
    success: boolean("success").notNull(),
    httpStatus: integer("http_status"),
    responseBody: text("response_body"),
    errorType: text("error_type"),
    errorMessage: text("error_message"),
    latencyMs: integer("latency_ms"),
    attemptNumber: integer("attempt_number").notNull().default(1),
  },
  (t) => [index("pub_logs_post_platform_idx").on(t.postPlatformId)]
);

// ─── Publisher: Relations ─────────────────────────────────────────────────────

export const publisherAccountRelations = relations(publisherAccounts, ({ one, many }) => ({
  user: one(user, { fields: [publisherAccounts.userId], references: [user.id] }),
  postPlatforms: many(publisherPostPlatforms),
}));

export const publisherCampaignRelations = relations(publisherCampaigns, ({ one, many }) => ({
  user: one(user, { fields: [publisherCampaigns.userId], references: [user.id] }),
  posts: many(publisherPosts),
}));

export const publisherPostRelations = relations(publisherPosts, ({ one, many }) => ({
  user: one(user, { fields: [publisherPosts.userId], references: [user.id] }),
  campaign: one(publisherCampaigns, { fields: [publisherPosts.campaignId], references: [publisherCampaigns.id] }),
  platforms: many(publisherPostPlatforms),
}));

export const publisherPostPlatformRelations = relations(publisherPostPlatforms, ({ one, many }) => ({
  post: one(publisherPosts, { fields: [publisherPostPlatforms.postId], references: [publisherPosts.id] }),
  account: one(publisherAccounts, { fields: [publisherPostPlatforms.accountId], references: [publisherAccounts.id] }),
  logs: many(publishLogs),
}));

export const publishLogRelations = relations(publishLogs, ({ one }) => ({
  postPlatform: one(publisherPostPlatforms, { fields: [publishLogs.postPlatformId], references: [publisherPostPlatforms.id] }),
}));

// ─── Creator Applications ──────────────────────────────────────────────────

export const creatorApplications = pgTable(
  "creator_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    // Profile info
    displayName: text("display_name").notNull(),
    username: text("username"),
    headline: text("headline"),
    bio: text("bio"),
    website: text("website"),
    portfolio: text("portfolio"),
    twitterHandle: text("twitter_handle"),
    githubHandle: text("github_handle"),
    linkedinHandle: text("linkedin_handle"),
    discordHandle: text("discord_handle"),
    // Application fields
    specialties: text("specialties").array().notNull().default([]),
    experienceLevel: text("experience_level").notNull().default("beginner"),
    // Payout
    payoutEmail: text("payout_email").notNull(),
    paymentMethod: text("payment_method").notNull().default("stripe"),
    // Tax / agreement
    agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
    // Status
    status: text("status").notNull().default("pending"), // pending | approved | rejected
    rejectionReason: text("rejection_reason"),
    reviewedBy: text("reviewed_by").references(() => user.id),
    reviewedAt: timestamp("reviewed_at"),
    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("creator_apps_user_idx").on(t.userId), index("creator_apps_status_idx").on(t.status)]
);

export const creatorApplicationRelations = relations(creatorApplications, ({ one }) => ({
  user: one(user, { fields: [creatorApplications.userId], references: [user.id] }),
  reviewer: one(user, { fields: [creatorApplications.reviewedBy], references: [user.id] }),
}));

export type CreatorApplication = typeof creatorApplications.$inferSelect;

// ─── Publisher: Types ─────────────────────────────────────────────────────────

export type PublisherAccount = typeof publisherAccounts.$inferSelect;
export type PublisherCampaign = typeof publisherCampaigns.$inferSelect;
export type PublisherPost = typeof publisherPosts.$inferSelect;
export type PublisherPostPlatform = typeof publisherPostPlatforms.$inferSelect;
export type PublishLog = typeof publishLogs.$inferSelect;

export type PostStatus =
  | "draft" | "waiting" | "queued" | "publishing" | "published"
  | "partial" | "failed" | "retrying" | "cancelled" | "archived";

export type PlatformSlug =
  | "x" | "reddit" | "linkedin" | "instagram" | "facebook"
  | "tiktok" | "youtube" | "bluesky" | "threads" | "pinterest";
