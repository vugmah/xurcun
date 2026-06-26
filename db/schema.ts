import { serial, varchar, text, boolean, timestamp, int, mysqlTable } from "drizzle-orm/mysql-core";

// Menu categories
export const menuCategories = mysqlTable("menu_categories", {
  id: serial("id"),
  // "catalog" = məhsul kataloqu · "cafe" = mağaza içi kofe menyusu (food/beverage)
  menuType: varchar("menu_type", { length: 50 }).notNull(),
  // NULL = ana kateqoriya · dolu = alt kateqoriya (Çay & Ədviyyat → Çay)
  parentId: int("parent_id"),
  titleAz: varchar("title_az", { length: 200 }).notNull(),
  titleRu: varchar("title_ru", { length: 200 }).notNull(),
  titleEn: varchar("title_en", { length: 200 }).notNull(),
  titleTr: varchar("title_tr", { length: 200 }),
  titleAr: varchar("title_ar", { length: 200 }),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Menu items
export const menuItems = mysqlTable("menu_items", {
  id: serial("id"),
  categoryId: int("category_id").notNull(),
  nameAz: varchar("name_az", { length: 300 }).notNull(),
  nameRu: varchar("name_ru", { length: 300 }).notNull(),
  nameEn: varchar("name_en", { length: 300 }).notNull(),
  nameTr: varchar("name_tr", { length: 300 }),
  nameAr: varchar("name_ar", { length: 300 }),
  price: varchar("price", { length: 50 }),
  priceVisible: boolean("price_visible").default(true), // qiymət gizlət/göstər
  unit: varchar("unit", { length: 50 }), // "500 q", "ədəd" vb. (opsional)
  descAz: text("desc_az"),
  descRu: text("desc_ru"),
  descEn: text("desc_en"),
  descTr: text("desc_tr"),
  descAr: text("desc_ar"),
  imageUrl: text("image_url"),
  imageAltAz: text("image_alt_az"),
  imageAltRu: text("image_alt_ru"),
  imageAltEn: text("image_alt_en"),
  sortOrder: int("sort_order").default(0),
  isFeatured: boolean("is_featured").default(false),
  isActive: boolean("is_active").default(true),
  isNew: boolean("is_new").default(false),
  isMeat: boolean("is_meat").default(false),
  isFish: boolean("is_fish").default(false),
  isVegetarian: boolean("is_vegetarian").default(false),
  isHalal: boolean("is_halal").default(false),
  isSpicy: boolean("is_spicy").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  isSugarFree: boolean("is_sugar_free").default(false),
  isSnack: boolean("is_snack").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product Images — çoxlu şəkil / qalereya (menu_items.id -> itemId)
export const productImages = mysqlTable("product_images", {
  id: serial("id"),
  itemId: int("item_id").notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  altAz: varchar("alt_az", { length: 200 }),
  altEn: varchar("alt_en", { length: 200 }),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product Variants — ölçü/rəng (məs. BOXFUL S/M/L, BLACK/WOOD)
export const productVariants = mysqlTable("product_variants", {
  id: serial("id"),
  itemId: int("item_id").notNull(),
  nameAz: varchar("name_az", { length: 150 }).notNull(),
  nameRu: varchar("name_ru", { length: 150 }),
  nameEn: varchar("name_en", { length: 150 }),
  nameTr: varchar("name_tr", { length: 150 }),
  nameAr: varchar("name_ar", { length: 150 }),
  price: varchar("price", { length: 50 }), // opsional fiyat override
  sku: varchar("sku", { length: 100 }),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

// Settings
export const settings = mysqlTable("settings", {
  id: serial("id"),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Photos
export const photos = mysqlTable("photos", {
  id: serial("id"),
  url: varchar("url", { length: 500 }).notNull(),
  alt: varchar("alt", { length: 200 }),
  altAz: varchar("alt_az", { length: 200 }),
  altRu: varchar("alt_ru", { length: 200 }),
  altEn: varchar("alt_en", { length: 200 }),
  section: varchar("section", { length: 100 }),
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// SEO Settings — per-page multilingual SEO (DB > dynamic > static fallback)
export const seoSettings = mysqlTable("seo_settings", {
  id: serial("id"),
  page: varchar("page", { length: 100 }).notNull(),
  ogImage: varchar("og_image", { length: 500 }),
  // Azerbaijani
  titleAz: varchar("title_az", { length: 200 }),
  descriptionAz: text("description_az"),
  keywordsAz: text("keywords_az"),
  ogTitleAz: varchar("og_title_az", { length: 200 }),
  ogDescriptionAz: text("og_description_az"),
  // Russian
  titleRu: varchar("title_ru", { length: 200 }),
  descriptionRu: text("description_ru"),
  keywordsRu: text("keywords_ru"),
  ogTitleRu: varchar("og_title_ru", { length: 200 }),
  ogDescriptionRu: text("og_description_ru"),
  // English
  titleEn: varchar("title_en", { length: 200 }),
  descriptionEn: text("description_en"),
  keywordsEn: text("keywords_en"),
  ogTitleEn: varchar("og_title_en", { length: 200 }),
  ogDescriptionEn: text("og_description_en"),
  // Turkish
  titleTr: varchar("title_tr", { length: 200 }),
  descriptionTr: text("description_tr"),
  keywordsTr: text("keywords_tr"),
  ogTitleTr: varchar("og_title_tr", { length: 200 }),
  ogDescriptionTr: text("og_description_tr"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tracking Settings
export const trackingSettings = mysqlTable("tracking_settings", {
  id: serial("id"),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mail Settings
export const mailSettings = mysqlTable("mail_settings", {
  id: serial("id"),
  key: varchar("key", { length: 100 }).notNull(),
  value: text("value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// cPanel Config
export const cpanelConfig = mysqlTable("cpanel_config", {
  id: serial("id"),
  host: varchar("host", { length: 200 }),
  username: varchar("username", { length: 100 }),
  password: text("password"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SMTP Settings
export const smtpSettings = mysqlTable("smtp_settings", {
  id: serial("id"),
  host: varchar("host", { length: 200 }),
  port: int("port").default(587),
  username: varchar("username", { length: 200 }),
  password: text("password"),
  secure: boolean("secure").default(false),
  fromEmail: varchar("from_email", { length: 200 }),
  fromName: varchar("from_name", { length: 200 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ═══════════════════════════════════════════════════════
// GOOGLE ADS TABLES
// ═══════════════════════════════════════════════════════

export const googleAdsSettings = mysqlTable("google_ads_settings", {
  id: serial("id"),
  developerToken: text("developer_token"),
  clientId: varchar("client_id", { length: 500 }),
  clientSecret: text("client_secret"),
  refreshToken: text("refresh_token"),
  loginCustomerId: varchar("login_customer_id", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const googleAdsCampaigns = mysqlTable("google_ads_campaigns", {
  id: serial("id"),
  name: varchar("name", { length: 200 }).notNull(),
  status: varchar("status", { length: 50 }).default("ENABLED"),
  budget: varchar("budget", { length: 50 }),
  type: varchar("type", { length: 50 }),
  dailyBudget: varchar("daily_budget", { length: 50 }),
  biddingStrategy: varchar("bidding_strategy", { length: 50 }),
  startDate: varchar("start_date", { length: 20 }),
  endDate: varchar("end_date", { length: 20 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const googleAdsAdGroups = mysqlTable("google_ads_ad_groups", {
  id: serial("id"),
  campaignId: int("campaign_id").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  status: varchar("status", { length: 50 }).default("ENABLED"),
  cpcBid: varchar("cpc_bid", { length: 50 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const googleAdsAds = mysqlTable("google_ads_ads", {
  id: serial("id"),
  adGroupId: int("ad_group_id").notNull(),
  headline1: varchar("headline1", { length: 100 }),
  headline2: varchar("headline2", { length: 100 }),
  headline3: varchar("headline3", { length: 100 }),
  description1: text("description1"),
  description2: text("description2"),
  finalUrl: varchar("final_url", { length: 500 }),
  status: varchar("status", { length: 50 }).default("ENABLED"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const googleAdsKeywords = mysqlTable("google_ads_keywords", {
  id: serial("id"),
  adGroupId: int("ad_group_id").notNull(),
  keyword: varchar("keyword", { length: 500 }).notNull(),
  matchType: varchar("match_type", { length: 50 }).default("BROAD"),
  cpcBid: varchar("cpc_bid", { length: 50 }),
  status: varchar("status", { length: 50 }).default("ENABLED"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const googleAdsConversions = mysqlTable("google_ads_conversions", {
  id: serial("id"),
  name: varchar("name", { length: 200 }).notNull(),
  category: varchar("category", { length: 100 }),
  value: varchar("value", { length: 50 }),
  count: varchar("count", { length: 50 }).default("EVERY"),
  status: varchar("status", { length: 50 }).default("ENABLED"),
  googleEvent: varchar("google_event", { length: 100 }),
  metaEvent: varchar("meta_event", { length: 100 }),
  gtmTrigger: varchar("gtm_trigger", { length: 200 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const googleAdsSchedules = mysqlTable("google_ads_schedules", {
  id: serial("id"),
  campaignId: int("campaign_id").notNull(),
  dayOfWeek: varchar("day_of_week", { length: 20 }).notNull(),
  startHour: int("start_hour").default(0),
  startMinute: int("start_minute").default(0),
  endHour: int("end_hour").default(23),
  endMinute: int("end_minute").default(59),
  bidModifier: varchar("bid_modifier", { length: 20 }).default("1.0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ═══════════════════════════════════════════════════════
// BRANCH TABLES (Phase 1 — Backend Persistence)
// ═══════════════════════════════════════════════════════

export const branches = mysqlTable("branches", {
  id: serial("id"),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  whatsappNumber: varchar("whatsapp_number", { length: 30 }), // filiala özəl WhatsApp (sifariş)
  mapUrl: varchar("map_url", { length: 500 }), // Google Maps linki
  videoUrl: varchar("video_url", { length: 500 }), // mağaza videosu (public/videos)
  hasCafe: boolean("has_cafe").default(false), // mağaza içi kofe menyusu var?
  sortOrder: int("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const menuItemBranches = mysqlTable("menu_item_branches", {
  id: serial("id"),
  branchId: int("branch_id").notNull(),
  menuItemId: int("menu_item_id").notNull(),
  branchPrice: varchar("branch_price", { length: 50 }),
  isAvailable: boolean("is_available").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact Emails
export const contactEmails = mysqlTable("contact_emails", {
  id: serial("id"),
  email: varchar("email", { length: 200 }).notNull(),
  name: varchar("name", { length: 200 }),
  subject: varchar("subject", { length: 300 }),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event Logs
export const eventLogs = mysqlTable("event_logs", {
  id: serial("id"),
  event: varchar("event", { length: 200 }).notNull(),
  data: text("data"),
  ip: varchar("ip", { length: 50 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Photo Assignments — links menu items to uploaded images
export const photoAssignments = mysqlTable("photo_assignments", {
  id: serial("id"),
  tab: varchar("tab", { length: 20 }).notNull(), // food, beverage, shisha
  catTitleAz: varchar("cat_title_az", { length: 100 }).notNull(),
  itemNameAz: varchar("item_name_az", { length: 200 }).notNull(),
  imageId: varchar("image_id", { length: 100 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  branchSlug: varchar("branch_slug", { length: 50 }).default("white-city"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ═══════════════════════════════════════════════════════
// POPUP CAMPAIGN TABLES
// ═══════════════════════════════════════════════════════

export const popupCampaigns = mysqlTable("popup_campaigns", {
  id: serial("id"),
  name: varchar("name", { length: 200 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // "welcome", "time", "discount", "exit", "scroll", "branch", "event"
  title: varchar("title", { length: 300 }),
  content: text("content"),
  imageUrl: varchar("image_url", { length: 500 }),
  ctaText: varchar("cta_text", { length: 100 }),
  ctaLink: varchar("cta_link", { length: 500 }),
  isActive: boolean("is_active").default(true),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  startHour: int("start_hour"),    // 0-23 for time-based
  endHour: int("end_hour"),        // 0-23 for time-based
  placement: varchar("placement", { length: 20 }).default("all"), // "all", "homepage", "qr", "homepage+qr"
  branch: varchar("branch", { length: 50 }), // "white-city", "seabreeze", null=all
  lang: varchar("lang", { length: 10 }),     // "az", "en", "ru", "tr", null=all
  frequency: int("frequency").default(1),    // max shows per session
  delay: int("delay").default(0),            // seconds before showing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const popupViews = mysqlTable("popup_views", {
  id: serial("id"),
  campaignId: int("campaign_id").notNull(),
  sessionId: varchar("session_id", { length: 100 }),
  viewedAt: timestamp("viewed_at").defaultNow(),
});

export const popupClicks = mysqlTable("popup_clicks", {
  id: serial("id"),
  campaignId: int("campaign_id").notNull(),
  sessionId: varchar("session_id", { length: 100 }),
  clickedAt: timestamp("clicked_at").defaultNow(),
});

// SEO Pages — per-path multilingual SEO entries
export const seoPages = mysqlTable("seo_pages", {
  id: serial("id"),
  path: varchar("path", { length: 255 }).notNull(),        // e.g., "/menu/white-city"
  lang: varchar("lang", { length: 10 }).notNull(),         // "az", "en", "ru", "tr"
  title: varchar("title", { length: 200 }),                // <title> content
  description: text("description"),                        // meta description
  ogTitle: varchar("og_title", { length: 200 }),           // OG title
  ogDescription: text("og_description"),                   // OG description
  ogImage: varchar("og_image", { length: 500 }),           // OG image URL
  keywords: text("keywords"),                              // comma-separated
  canonical: varchar("canonical", { length: 500 }),        // canonical URL
  noIndex: boolean("no_index").default(false),             // noindex flag
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ═══════════════════════════════════════════════════════
// AI MENU INTELLIGENCE TABLES
// ═══════════════════════════════════════════════════════

// Anonymous menu interaction events (GDPR-safe, no PII)
export const menuEvents = mysqlTable("menu_events", {
  id: serial("id"),
  sessionId: varchar("session_id", { length: 64 }).notNull(), // anonymous session hash
  eventType: varchar("event_type", { length: 50 }).notNull(), // "view", "hover", "qr_scan", "print", "favorite"
  itemId: int("item_id"), // menu item id (null for page-level events)
  itemName: varchar("item_name", { length: 200 }), // denormalized for aggregation
  category: varchar("category", { length: 100 }), // e.g. "İçkilər", "Desertlər"
  branchSlug: varchar("branch_slug", { length: 50 }).default("white-city"),
  lang: varchar("lang", { length: 10 }).default("az"),
  source: varchar("source", { length: 20 }).default("qr"), // "qr", "homepage", "admin"
  metadata: text("metadata"), // JSON: { deviceType, userAgentHash }
  createdAt: timestamp("created_at").defaultNow(),
});

// AI badge recommendations with human approval lifecycle
export const badgeRecommendations = mysqlTable("badge_recommendations", {
  id: serial("id"),
  itemId: int("item_id").notNull(),
  itemName: varchar("item_name", { length: 200 }).notNull(),
  branchSlug: varchar("branch_slug", { length: 50 }).default("white-city"),
  // Badge type: one of the 9 supported
  badgeType: varchar("badge_type", { length: 20 }).notNull(), // "isNew", "isSpicy", "isSnack", "isPopular", "isRecommended", "isStaffPick", "isChefSpecial", "isSeasonal", "isBestseller"
  // AI reasoning
  confidence: int("confidence").notNull(), // 0-100
  reason: text("reason").notNull(), // "35 hover events", "favorited 28x", etc.
  dataPoints: text("data_points"), // JSON: { views: 42, hovers: 35, avgTime: 12.5, rank: 3 }
  // Human approval lifecycle
  status: varchar("status", { length: 20 }).default("pending").notNull(), // "pending", "approved", "rejected", "snoozed"
  approvedBy: varchar("approved_by", { length: 100 }), // admin user name/email
  approvedAt: timestamp("approved_at"),
  rejectedReason: text("rejected_reason"), // "too generic", "menu mismatch", etc.
  snoozeUntil: timestamp("snooze_until"), // when to re-suggest
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Human-approved badges (DB source-of-truth for badge rendering)
export const approvedBadges = mysqlTable("approved_badges", {
  id: serial("id"),
  itemId: int("item_id").notNull(),
  itemName: varchar("item_name", { length: 200 }).notNull(),
  branchSlug: varchar("branch_slug", { length: 50 }).default("white-city"),
  badgeType: varchar("badge_type", { length: 20 }).notNull(),
  // AI context (kept for reference)
  aiConfidence: int("ai_confidence"), // 0-100
  aiReason: text("ai_reason"), // "35 hover events..."
  // Human context
  approvedBy: varchar("approved_by", { length: 100 }),
  approvedAt: timestamp("approved_at").defaultNow(),
  // Display config
  displayOrder: int("display_order").default(0), // for sorting (popular first)
  isActive: boolean("is_active").default(true), // can be manually disabled
  // Timestamps
  updatedAt: timestamp("updated_at").defaultNow(),
});
