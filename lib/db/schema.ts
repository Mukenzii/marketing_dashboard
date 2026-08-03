import {
  pgTable,
  pgEnum,
  text,
  boolean,
  integer,
  bigint,
  numeric,
  date,
  timestamp,
  jsonb,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/*  Enums                                                                      */
/* -------------------------------------------------------------------------- */
// NOTE: roles are intentionally NOT an enum — they live in the `roles` table
// so a third role is an INSERT, not a schema migration. Counts are always read
// from the DB (never hardcoded).
export const userStatus = pgEnum("user_status", ["active", "inactive"]);
export const brand = pgEnum("brand", ["falaq_nashr", "falaq_kids"]);
export const bookStatus = pgEnum("book_status", [
  "planning",
  "active",
  "completed",
  "archived",
]);
// PR-manager performance category (A+/A/B/C), auto-derived from 3-month sales
// with the option to override manually. "new" = freshly launched, no history.
export const bookCategory = pgEnum("book_category", ["A+", "A", "B", "C", "new"]);
// Narrowed: ad/"targeting" spend now lives in insights_daily (synced from Meta,
// immutable). spend_entries is only hand-typed blogger fees & production costs.
export const spendType = pgEnum("spend_type", ["blogger", "production"]);

/* -------------------------------------------------------------------------- */
/*  Roles (extensible RBAC)                                                    */
/* -------------------------------------------------------------------------- */
export const roles = pgTable("roles", {
  key: text("key").primaryKey(), // e.g. 'pr_manager', 'ceo'
  name: text("name").notNull(),
  description: text("description"),
  // privileged roles (e.g. ceo) see everything; drives the "at least one CEO"
  // guard so a company can't lock itself out.
  isPrivileged: boolean("is_privileged").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  Auth tables (owned by Better Auth; extended with role/status/lastLogin)    */
/* -------------------------------------------------------------------------- */
export const users = pgTable("users", {
  id: text("id").primaryKey(), // Better Auth generates string ids
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // --- app-managed fields ---
  role: text("role")
    .notNull()
    .default("pr_manager")
    .references(() => roles.key),
  status: userStatus("status").notNull().default("active"),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"), // credential hash (email/password provider)
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);

/* -------------------------------------------------------------------------- */
/*  Domain tables (RLS-protected)                                             */
/* -------------------------------------------------------------------------- */
export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    brand: brand("brand").notNull(),
    // nullable → unassigned book (CEO-only visibility)
    ownerId: text("owner_id").references(() => users.id, {
      onDelete: "set null",
    }),
    launchDate: date("launch_date"),
    budgetAllocated: numeric("budget_allocated", {
      precision: 14,
      scale: 2,
    })
      .notNull()
      .default("0"),
    // Budget currency + FX rate to the base currency (UZS). See lib/money.ts.
    currency: text("currency").notNull().default("UZS"),
    fxRate: numeric("fx_rate", { precision: 18, scale: 8 })
      .notNull()
      .default("1"),
    status: bookStatus("status").notNull().default("planning"),
    // --- PR-manager performance tracker (edited by the owning manager) ---
    category: bookCategory("category"), // A+/A/B/C/new — auto or overridden
    categoryOverride: boolean("category_override").notNull().default(false),
    printRun: integer("print_run"), // Nashr soni
    stockRemaining: integer("stock_remaining"), // Astatka (qoldiq)
    salesPrevMonth: integer("sales_prev_month"), // Sotuv (oldingi oy)
    salesCount: integer("sales_count"), // Sotuv (joriy oy) — drives category
    marketingBudget: numeric("marketing_budget", { precision: 14, scale: 2 }), // Byudjet
    targetSales: integer("target_sales"), // Target
    targetBudget: numeric("target_budget", { precision: 14, scale: 2 }), // Target byudjeti
    targetOtherBook: numeric("target_other_book", { precision: 14, scale: 2 }), // Target boshqa kitobga
    percent: numeric("percent", { precision: 7, scale: 2 }), // Foiz
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("books_owner_id_idx").on(t.ownerId)],
);

// Per-book blogger budgets: how much a PR manager allocates to a blogger and
// how much was actually spent. Scoped through the owning book (RLS).
export const bloggers = pgTable(
  "bloggers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    platform: text("platform"), // Instagram / Telegram / YouTube / …
    budgetAllocated: numeric("budget_allocated", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    spent: numeric("spent", { precision: 14, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("UZS"),
    note: text("note"),
    createdBy: text("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("bloggers_book_id_idx").on(t.bookId)],
);

export const spendEntries = pgTable(
  "spend_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    type: spendType("type").notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    // Spend often arrives in USD; convert to UZS via fx_rate. See lib/money.ts.
    currency: text("currency").notNull().default("UZS"),
    fxRate: numeric("fx_rate", { precision: 18, scale: 8 })
      .notNull()
      .default("1"),
    vendor: text("vendor"), // vendor / blogger name
    promoCode: text("promo_code"),
    spentAt: date("spent_at").notNull(),
    // created_by never changes when a book is reassigned (history integrity)
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("spend_entries_book_id_idx").on(t.bookId),
    index("spend_entries_created_by_idx").on(t.createdBy),
  ],
);

export const results = pgTable(
  "results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    spendEntryId: uuid("spend_entry_id").references(() => spendEntries.id, {
      onDelete: "set null",
    }),
    reach: integer("reach").notNull().default(0),
    views: integer("views").notNull().default(0),
    engagement: integer("engagement").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    directOrders: integer("direct_orders").notNull().default(0),
    revenue: numeric("revenue", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    // Revenue currency + FX rate to base (UZS). See lib/money.ts.
    currency: text("currency").notNull().default("UZS"),
    fxRate: numeric("fx_rate", { precision: 18, scale: 8 })
      .notNull()
      .default("1"),
    recordedAt: timestamp("recorded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("results_book_id_idx").on(t.bookId)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id), // actor
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    oldValue: jsonb("old_value"),
    newValue: jsonb("new_value"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("audit_log_entity_idx").on(t.entityType, t.entityId)],
);

/* -------------------------------------------------------------------------- */
/*  Ad-platform mirror (synced from Meta; immutable, computed upward)          */
/* -------------------------------------------------------------------------- */
export const insightsEntity = pgEnum("insights_entity", [
  "ad",
  "adset",
  "campaign",
  "account",
]);
export const parseStatus = pgEnum("parse_status", ["ok", "partial", "failed"]);
export const syncStatus = pgEnum("sync_status", [
  "running",
  "success",
  "failed",
]);
export const notificationType = pgEnum("notification_type", [
  "task_assigned",
  "fatigue",
  "budget",
  "sync",
  "info",
]);

export const adAccounts = pgTable("ad_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  metaAccountId: text("meta_account_id").notNull().unique(),
  name: text("name"),
  currency: text("currency").notNull().default("USD"),
  timezone: text("timezone"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    metaCampaignId: text("meta_campaign_id").notNull().unique(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => adAccounts.id, { onDelete: "cascade" }),
    nameRaw: text("name_raw").notNull(),
    objective: text("objective"),
    status: text("status"),
    // actual budgets from the API (pacing always uses these)
    dailyBudget: numeric("daily_budget", { precision: 14, scale: 2 }),
    lifetimeBudget: numeric("lifetime_budget", { precision: 14, scale: 2 }),
    startTime: timestamp("start_time", { withTimezone: true }),
    stopTime: timestamp("stop_time", { withTimezone: true }),
    // link to a book — nullable; NULL is visible to privileged users only
    bookId: uuid("book_id").references(() => books.id, { onDelete: "set null" }),
    bookLinkConfirmed: boolean("book_link_confirmed").notNull().default(false),
    // --- parsed from name_raw (see lib parser); §4 ---
    accountCode: text("account_code"),
    funnelStage: text("funnel_stage"),
    parsedBookTitle: text("parsed_book_title"),
    parsedObjective: text("parsed_objective"),
    costCap: numeric("cost_cap", { precision: 14, scale: 2 }),
    flightStart: date("flight_start"),
    flightEnd: date("flight_end"),
    plannedBudget: numeric("planned_budget", { precision: 14, scale: 2 }),
    parseStatus: parseStatus("parse_status").notNull().default("failed"),
    parseErrors: jsonb("parse_errors"),
    // manual overrides a re-sync must never clobber: { field: value }
    fieldOverrides: jsonb("field_overrides").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("campaigns_book_id_idx").on(t.bookId),
    index("campaigns_account_id_idx").on(t.accountId),
    index("campaigns_parse_status_idx").on(t.parseStatus),
  ],
);

export const adSets = pgTable(
  "ad_sets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    metaAdsetId: text("meta_adset_id").notNull().unique(),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    name: text("name"),
    optimizationGoal: text("optimization_goal"),
    bidStrategy: text("bid_strategy"),
    bidAmount: numeric("bid_amount", { precision: 14, scale: 2 }),
    dailyBudget: numeric("daily_budget", { precision: 14, scale: 2 }),
    lifetimeBudget: numeric("lifetime_budget", { precision: 14, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("ad_sets_campaign_id_idx").on(t.campaignId)],
);

export const ads = pgTable(
  "ads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    metaAdId: text("meta_ad_id").notNull().unique(),
    adSetId: uuid("ad_set_id")
      .notNull()
      .references(() => adSets.id, { onDelete: "cascade" }),
    name: text("name"),
    creativeId: text("creative_id"),
    thumbnailUrl: text("thumbnail_url"),
    status: text("status"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("ads_ad_set_id_idx").on(t.adSetId)],
);

// Raw daily metrics only — NEVER derived ratios (CTR/CPM/CPL/HOOK/HOLD are
// computed at read time in lib/metrics.ts). campaign_id is denormalized for
// RLS scoping; account-level rows have campaign_id NULL (privileged-only).
export const insightsDaily = pgTable(
  "insights_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    entityType: insightsEntity("entity_type").notNull(),
    entityId: text("entity_id").notNull(), // meta id of the entity
    campaignId: uuid("campaign_id").references(() => campaigns.id, {
      onDelete: "cascade",
    }),
    adAccountId: uuid("ad_account_id")
      .notNull()
      .references(() => adAccounts.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    // currency inherited from ad_account + fx to UZS captured at sync time
    currency: text("currency").notNull().default("USD"),
    fxRate: numeric("fx_rate", { precision: 18, scale: 8 })
      .notNull()
      .default("1"),
    // --- raw metrics ---
    spend: numeric("spend", { precision: 18, scale: 4 }).notNull().default("0"),
    impressions: bigint("impressions", { mode: "number" }).notNull().default(0),
    reach: bigint("reach", { mode: "number" }).notNull().default(0),
    frequency: numeric("frequency", { precision: 12, scale: 4 })
      .notNull()
      .default("0"),
    clicks: bigint("clicks", { mode: "number" }).notNull().default(0),
    uniqueClicks: bigint("unique_clicks", { mode: "number" })
      .notNull()
      .default(0),
    inlineLinkClicks: bigint("inline_link_clicks", { mode: "number" })
      .notNull()
      .default(0),
    uniqueInlineLinkClicks: bigint("unique_inline_link_clicks", {
      mode: "number",
    })
      .notNull()
      .default(0),
    outboundClicks: bigint("outbound_clicks", { mode: "number" })
      .notNull()
      .default(0),
    uniqueOutboundClicks: bigint("unique_outbound_clicks", { mode: "number" })
      .notNull()
      .default(0),
    landingPageViews: bigint("landing_page_views", { mode: "number" })
      .notNull()
      .default(0),
    leads: bigint("leads", { mode: "number" }).notNull().default(0),
    video3sViews: bigint("video_3s_views", { mode: "number" })
      .notNull()
      .default(0),
    videoThruplay: bigint("video_thruplay", { mode: "number" })
      .notNull()
      .default(0),
    videoP25: bigint("video_p25", { mode: "number" }).notNull().default(0),
    videoP50: bigint("video_p50", { mode: "number" }).notNull().default(0),
    videoP75: bigint("video_p75", { mode: "number" }).notNull().default(0),
    videoP100: bigint("video_p100", { mode: "number" }).notNull().default(0),
    purchases: bigint("purchases", { mode: "number" }).notNull().default(0),
    purchaseValue: numeric("purchase_value", { precision: 18, scale: 4 })
      .notNull()
      .default("0"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("insights_daily_entity_date_uq").on(
      t.entityType,
      t.entityId,
      t.date,
    ),
    index("insights_daily_campaign_id_idx").on(t.campaignId),
    index("insights_daily_date_idx").on(t.date),
    // Dashboard/charts filter by entity_type then group/aggregate by date.
    index("insights_daily_entity_type_date_idx").on(t.entityType, t.date),
  ],
);

export const syncRuns = pgTable("sync_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  status: syncStatus("status").notNull().default("running"),
  dateFrom: date("date_from"),
  dateTo: date("date_to"),
  rowsUpserted: integer("rows_upserted").notNull().default(0),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Per-user notification inbox. Task assignments and (deduped) system alerts.
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationType("type").notNull().default("info"),
    tone: text("tone").notNull().default("info"), // alert | warn | info (icon)
    title: text("title").notNull(),
    body: text("body"),
    link: text("link"),
    // stable key so re-running a generator (e.g. daily sync) never duplicates
    dedupeKey: text("dedupe_key"),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("notifications_user_idx").on(t.userId, t.isRead),
    // NULL dedupeKey rows (task assignments) are all distinct → never deduped
    uniqueIndex("notifications_user_dedupe_uq").on(t.userId, t.dedupeKey),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Team work                                                                  */
/* -------------------------------------------------------------------------- */
export const taskStatus = pgEnum("task_status", [
  "todo",
  "in_progress",
  "review",
  "done",
  "blocked",
]);
export const taskPriority = pgEnum("task_priority", ["low", "normal", "high"]);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    bookId: uuid("book_id").references(() => books.id, { onDelete: "set null" }),
    assigneeId: text("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    status: taskStatus("status").notNull().default("todo"),
    priority: taskPriority("priority").notNull().default("normal"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("tasks_assignee_id_idx").on(t.assigneeId),
    index("tasks_created_by_idx").on(t.createdBy),
    index("tasks_book_id_idx").on(t.bookId),
    index("tasks_status_idx").on(t.status),
  ],
);

export const taskComments = pgTable(
  "task_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("task_comments_task_id_idx").on(t.taskId)],
);

/* -------------------------------------------------------------------------- */
/*  Config — threshold rules driving OK/Warn/Alert badges                      */
/* -------------------------------------------------------------------------- */
export const metricThresholds = pgTable(
  "metric_thresholds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    metricKey: text("metric_key").notNull(),
    objective: text("objective"), // nullable → applies to all objectives
    brand: brand("brand"), // nullable → applies to all brands
    warnBelow: numeric("warn_below", { precision: 18, scale: 6 }),
    warnAbove: numeric("warn_above", { precision: 18, scale: 6 }),
    alertBelow: numeric("alert_below", { precision: 18, scale: 6 }),
    alertAbove: numeric("alert_above", { precision: 18, scale: 6 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("metric_thresholds_key_obj_brand_uq").on(
      t.metricKey,
      t.objective,
      t.brand,
    ),
  ],
);
