import "server-only";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, sql } from "drizzle-orm";
import * as schema from "@/lib/db/schema";
import { MetaClient, metaAccountIds, metaConfigured } from "./client";
import { parseCampaignName } from "./parse";
import { usdToUzs } from "./fx";
import { uz } from "@/lib/i18n/uz";

export type SyncSummary = {
  accounts: number;
  campaigns: number;
  adSets: number;
  ads: number;
  books: number;
  insightRows: number;
  dateFrom: string | null;
  dateTo: string | null;
};

/** Extract an action value (rounded) by action_type, trying each alias in order. */
function actionVal(
  actions: unknown,
  types: string[],
): number {
  if (!Array.isArray(actions)) return 0;
  for (const t of types) {
    const hit = (actions as Array<{ action_type?: string; value?: string }>).find(
      (a) => a.action_type === t,
    );
    if (hit?.value != null) return Math.round(Number(hit.value) || 0);
  }
  return 0;
}

const cents = (v: unknown): string | null => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? (n / 100).toFixed(2) : null;
};

const METRIC_FIELDS = [
  "date_start",
  "spend",
  "impressions",
  "reach",
  "frequency",
  "clicks",
  "inline_link_clicks",
  "unique_inline_link_clicks",
  "outbound_clicks",
  "unique_outbound_clicks",
  "actions",
  "action_values",
  "video_play_actions",
  "video_thruplay_watched_actions",
  "video_p25_watched_actions",
  "video_p50_watched_actions",
  "video_p75_watched_actions",
  "video_p100_watched_actions",
].join(",");

type InsightValues = typeof schema.insightsDaily.$inferInsert;

/** Map one Graph insights row → an insights_daily row for a given grain. */
function mapInsight(
  r: Record<string, unknown>,
  entityType: "campaign" | "account" | "ad",
  entityId: string,
  campaignUuid: string | null,
  accountUuid: string,
  currency: string,
  fxStr: string,
): InsightValues {
  return {
    entityType,
    entityId,
    campaignId: campaignUuid,
    adAccountId: accountUuid,
    date: r.date_start as string,
    currency,
    fxRate: fxStr,
    spend: String(r.spend ?? "0"),
    impressions: Math.round(Number(r.impressions) || 0),
    reach: Math.round(Number(r.reach) || 0),
    frequency: String(r.frequency ?? "0"),
    clicks: Math.round(Number(r.clicks) || 0),
    inlineLinkClicks: Math.round(Number(r.inline_link_clicks) || 0),
    uniqueInlineLinkClicks: Math.round(Number(r.unique_inline_link_clicks) || 0),
    outboundClicks: actionVal(r.outbound_clicks, ["outbound_click"]),
    uniqueOutboundClicks: actionVal(r.unique_outbound_clicks, ["outbound_click"]),
    landingPageViews: actionVal(r.actions, ["landing_page_view"]),
    leads: actionVal(r.actions, [
      "lead",
      "onsite_conversion.lead_grouped",
      "offsite_conversion.fb_pixel_lead",
    ]),
    video3sViews: actionVal(r.video_play_actions, ["video_view"]),
    videoThruplay: actionVal(r.video_thruplay_watched_actions, ["video_view"]),
    videoP25: actionVal(r.video_p25_watched_actions, ["video_view"]),
    videoP50: actionVal(r.video_p50_watched_actions, ["video_view"]),
    videoP75: actionVal(r.video_p75_watched_actions, ["video_view"]),
    videoP100: actionVal(r.video_p100_watched_actions, ["video_view"]),
    purchases: actionVal(r.actions, ["purchase", "omni_purchase"]),
    purchaseValue: String(actionVal(r.action_values, ["purchase", "omni_purchase"])),
  };
}

/** Chunked upsert on (entity_type, entity_id, date). Returns rows written. */
async function upsertInsights(
  db: ReturnType<typeof drizzle>,
  rows: InsightValues[],
): Promise<number> {
  let n = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    if (!chunk.length) continue;
    await db
      .insert(schema.insightsDaily)
      .values(chunk)
      .onConflictDoUpdate({
        target: [
          schema.insightsDaily.entityType,
          schema.insightsDaily.entityId,
          schema.insightsDaily.date,
        ],
        set: {
          campaignId: sql`excluded.campaign_id`,
          adAccountId: sql`excluded.ad_account_id`,
          currency: sql`excluded.currency`,
          fxRate: sql`excluded.fx_rate`,
          spend: sql`excluded.spend`,
          impressions: sql`excluded.impressions`,
          reach: sql`excluded.reach`,
          frequency: sql`excluded.frequency`,
          clicks: sql`excluded.clicks`,
          inlineLinkClicks: sql`excluded.inline_link_clicks`,
          uniqueInlineLinkClicks: sql`excluded.unique_inline_link_clicks`,
          outboundClicks: sql`excluded.outbound_clicks`,
          uniqueOutboundClicks: sql`excluded.unique_outbound_clicks`,
          landingPageViews: sql`excluded.landing_page_views`,
          leads: sql`excluded.leads`,
          video3sViews: sql`excluded.video_3s_views`,
          videoThruplay: sql`excluded.video_thruplay`,
          videoP25: sql`excluded.video_p25`,
          videoP50: sql`excluded.video_p50`,
          videoP75: sql`excluded.video_p75`,
          videoP100: sql`excluded.video_p100`,
          purchases: sql`excluded.purchases`,
          purchaseValue: sql`excluded.purchase_value`,
          updatedAt: new Date(),
        },
      });
    n += chunk.length;
  }
  return n;
}

/**
 * Pull live Meta Ads data into ad_accounts / campaigns / ad_sets / ads /
 * insights_daily (ad-level, daily) — the same tables the dashboard already
 * reads. Books are upserted from parsed campaign titles so book-level rollups
 * work. Runs on the owner connection (admin job, bypasses RLS). Never called
 * with untrusted input.
 *
 * @param opts.reset  wipe the demo/marketing fixtures first (use for the first
 *                    real sync). Refreshes should pass false to keep books and
 *                    their CEO-assigned owners.
 * @param opts.days   how many days of daily insights to pull (default 30).
 */
export async function runMetaSync(opts?: {
  reset?: boolean;
  days?: number;
  withEntities?: boolean; // also sync ad sets + ads (more API calls). default off.
}): Promise<SyncSummary> {
  if (!metaConfigured())
    throw new Error(
      "Meta is not configured — set META_APP_SECRET, META_ACCESS_TOKEN and META_AD_ACCOUNT_IDS in .env",
    );

  const days = opts?.days ?? 30;
  const url = process.env.DATABASE_URL_MIGRATOR;
  if (!url) throw new Error("DATABASE_URL_MIGRATOR missing");

  const sqlc = postgres(url, { prepare: false });
  const db = drizzle(sqlc, { schema });
  const meta = new MetaClient();
  const nowYear = Number(new Date().getFullYear());

  const summary: SyncSummary = {
    accounts: 0,
    campaigns: 0,
    adSets: 0,
    ads: 0,
    books: 0,
    insightRows: 0,
    dateFrom: null,
    dateTo: null,
  };

  // open a sync_runs record
  const [run] = await db
    .insert(schema.syncRuns)
    .values({ status: "running" })
    .returning({ id: schema.syncRuns.id });

  try {
    const fx = await usdToUzs();
    const fxStr = String(fx);

    if (opts?.reset) {
      // child → parent, respecting FK actions (tasks.book_id → SET NULL survives)
      await db.execute(sql`DELETE FROM insights_daily`);
      await db.execute(sql`DELETE FROM ads`);
      await db.execute(sql`DELETE FROM ad_sets`);
      await db.execute(sql`DELETE FROM campaigns`);
      await db.execute(sql`DELETE FROM ad_accounts`);
      await db.execute(sql`DELETE FROM books`);
    }

    for (const actId of metaAccountIds()) {
      // ---- ad account ----
      const acc = await meta.node(
        actId,
        "name,account_status,currency,timezone_name",
      );
      const [accRow] = await db
        .insert(schema.adAccounts)
        .values({
          metaAccountId: actId,
          name: (acc.name as string) ?? actId,
          currency: (acc.currency as string) ?? "USD",
          timezone: (acc.timezone_name as string) ?? null,
        })
        .onConflictDoUpdate({
          target: schema.adAccounts.metaAccountId,
          set: {
            name: (acc.name as string) ?? actId,
            currency: (acc.currency as string) ?? "USD",
            timezone: (acc.timezone_name as string) ?? null,
            updatedAt: new Date(),
          },
        })
        .returning({ id: schema.adAccounts.id, currency: schema.adAccounts.currency });
      const accountUuid = accRow.id;
      const currency = accRow.currency;
      summary.accounts++;

      // ---- campaigns ----
      const camps = await meta.edge(
        actId,
        "campaigns",
        "name,objective,status,daily_budget,lifetime_budget,start_time,stop_time",
      );

      const campUuidByMeta = new Map<string, string>();
      // group parsed titles → budgets for book upsert
      const bookAgg = new Map<
        string,
        { planned: number; launch: string | null }
      >();
      const campToTitle = new Map<string, string | null>();

      for (const c of camps) {
        const nameRaw = (c.name as string) ?? "";
        const p = parseCampaignName(nameRaw, nowYear);
        const [row] = await db
          .insert(schema.campaigns)
          .values({
            metaCampaignId: c.id as string,
            accountId: accountUuid,
            nameRaw,
            objective: (c.objective as string) ?? null,
            status: (c.status as string) ?? null,
            dailyBudget: cents(c.daily_budget),
            lifetimeBudget: cents(c.lifetime_budget),
            startTime: c.start_time ? new Date(c.start_time as string) : null,
            stopTime: c.stop_time ? new Date(c.stop_time as string) : null,
            accountCode: p.accountCode,
            funnelStage: p.funnelStage,
            parsedBookTitle: p.parsedBookTitle,
            parsedObjective: p.parsedObjective,
            costCap: p.costCap == null ? null : String(p.costCap),
            flightStart: p.flightStart,
            flightEnd: p.flightEnd,
            plannedBudget: p.plannedBudget == null ? null : String(p.plannedBudget),
            parseStatus: p.parseStatus,
            parseErrors: p.parseErrors,
          })
          .onConflictDoUpdate({
            target: schema.campaigns.metaCampaignId,
            set: {
              nameRaw,
              objective: (c.objective as string) ?? null,
              status: (c.status as string) ?? null,
              dailyBudget: cents(c.daily_budget),
              lifetimeBudget: cents(c.lifetime_budget),
              startTime: c.start_time ? new Date(c.start_time as string) : null,
              stopTime: c.stop_time ? new Date(c.stop_time as string) : null,
              accountCode: p.accountCode,
              funnelStage: p.funnelStage,
              parsedBookTitle: p.parsedBookTitle,
              parsedObjective: p.parsedObjective,
              costCap: p.costCap == null ? null : String(p.costCap),
              flightStart: p.flightStart,
              flightEnd: p.flightEnd,
              plannedBudget:
                p.plannedBudget == null ? null : String(p.plannedBudget),
              parseStatus: p.parseStatus,
              parseErrors: p.parseErrors,
              updatedAt: new Date(),
            },
          })
          .returning({ id: schema.campaigns.id });

        campUuidByMeta.set(c.id as string, row.id);
        campToTitle.set(row.id, p.parsedBookTitle);
        summary.campaigns++;

        if (p.parsedBookTitle) {
          const key = p.parsedBookTitle.toLowerCase();
          const cur = bookAgg.get(key) ?? { planned: 0, launch: null };
          cur.planned += p.plannedBudget ?? 0;
          if (p.flightStart && (!cur.launch || p.flightStart < cur.launch))
            cur.launch = p.flightStart;
          bookAgg.set(key, cur);
        }
      }

      // ---- books from parsed titles (match existing by title, else create) ----
      const bookIdByTitle = new Map<string, string>();
      for (const c of camps) {
        const title = parseCampaignName((c.name as string) ?? "", nowYear)
          .parsedBookTitle;
        if (!title) continue;
        const key = title.toLowerCase();
        if (bookIdByTitle.has(key)) continue;

        const existing = await db
          .select({ id: schema.books.id })
          .from(schema.books)
          .where(sql`lower(${schema.books.title}) = ${key}`)
          .limit(1);

        if (existing.length) {
          bookIdByTitle.set(key, existing[0].id);
        } else {
          const agg = bookAgg.get(key);
          const budgetUZS = agg ? Math.round(agg.planned * fx) : 0;
          const [b] = await db
            .insert(schema.books)
            .values({
              title,
              brand: "falaq_nashr",
              ownerId: null,
              launchDate: agg?.launch ?? null,
              budgetAllocated: String(budgetUZS),
              currency: "UZS",
              fxRate: "1",
              status: "active",
            })
            .returning({ id: schema.books.id });
          bookIdByTitle.set(key, b.id);
          summary.books++;
        }
      }

      // link campaigns → books (only where not manually confirmed away)
      for (const [campUuid, title] of campToTitle) {
        if (!title) continue;
        const bookId = bookIdByTitle.get(title.toLowerCase());
        if (!bookId) continue;
        await db
          .update(schema.campaigns)
          .set({ bookId, bookLinkConfirmed: true, updatedAt: new Date() })
          .where(eq(schema.campaigns.id, campUuid));
      }

      // ---- ad sets + ads (best-effort; ~6 cheap calls). Disable with
      //      withEntities:false if the account is huge and rate limits bite. ----
      const adsetUuidByMeta = new Map<string, string>();
      if (opts?.withEntities ?? true) try {
        const adsets = await meta.edge(
          actId,
          "adsets",
          "name,campaign_id,optimization_goal,bid_strategy,bid_amount,daily_budget,lifetime_budget",
        );
        for (const a of adsets) {
          const campUuid = campUuidByMeta.get(a.campaign_id as string);
          if (!campUuid) continue;
          const [row] = await db
            .insert(schema.adSets)
            .values({
              metaAdsetId: a.id as string,
              campaignId: campUuid,
              name: (a.name as string) ?? null,
              optimizationGoal: (a.optimization_goal as string) ?? null,
              bidStrategy: (a.bid_strategy as string) ?? null,
              bidAmount: cents(a.bid_amount),
              dailyBudget: cents(a.daily_budget),
              lifetimeBudget: cents(a.lifetime_budget),
            })
            .onConflictDoUpdate({
              target: schema.adSets.metaAdsetId,
              set: {
                campaignId: campUuid,
                name: (a.name as string) ?? null,
                optimizationGoal: (a.optimization_goal as string) ?? null,
                bidStrategy: (a.bid_strategy as string) ?? null,
                bidAmount: cents(a.bid_amount),
                dailyBudget: cents(a.daily_budget),
                lifetimeBudget: cents(a.lifetime_budget),
                updatedAt: new Date(),
              },
            })
            .returning({ id: schema.adSets.id });
          adsetUuidByMeta.set(a.id as string, row.id);
          summary.adSets++;
        }

        // ---- ads (best-effort) ----
        // small pages: expanding creative{} for many ads at once trips Meta's
        // "reduce the amount of data you're asking for" limit.
        const adRows = await meta.edge(
          actId,
          "ads",
          "name,adset_id,status,creative{id,thumbnail_url}",
          { limit: "100" },
        );
        for (const ad of adRows) {
          const adsetUuid = adsetUuidByMeta.get(ad.adset_id as string);
          if (!adsetUuid) continue;
          const creative = ad.creative as
            | { id?: string; thumbnail_url?: string }
            | undefined;
          await db
            .insert(schema.ads)
            .values({
              metaAdId: ad.id as string,
              adSetId: adsetUuid,
              name: (ad.name as string) ?? null,
              creativeId: creative?.id ?? null,
              thumbnailUrl: creative?.thumbnail_url ?? null,
              status: (ad.status as string) ?? null,
            })
            .onConflictDoUpdate({
              target: schema.ads.metaAdId,
              set: {
                adSetId: adsetUuid,
                name: (ad.name as string) ?? null,
                creativeId: creative?.id ?? null,
                thumbnailUrl: creative?.thumbnail_url ?? null,
                status: (ad.status as string) ?? null,
                updatedAt: new Date(),
              },
            });
          summary.ads++;
        }
      } catch (e) {
        console.warn("[meta-sync] ad sets/ads step failed (non-fatal):", (e as Error).message);
      }

      // ---- daily insights ----
      // Campaign-level rows carry additive metrics (spend/impressions/clicks)
      // AND deduped reach/frequency; account-level rows carry account reach for
      // the MoM comparison. Ad-level is intentionally skipped — a per-ad × daily
      // pull (1000+ ads) trips Meta's app rate limit and adds nothing the
      // dashboard aggregates don't already get from the campaign grain.
      const preset =
        days <= 7 ? "last_7d" : days <= 14 ? "last_14d" : days <= 30 ? "last_30d" : "last_90d";

      const campRows = await meta.edge(
        actId,
        "insights",
        METRIC_FIELDS + ",campaign_id",
        { level: "campaign", time_increment: "1", date_preset: preset },
      );
      const acctRows = await meta.edge(actId, "insights", METRIC_FIELDS, {
        level: "account",
        time_increment: "1",
        date_preset: preset,
      });

      const rows = [
        ...campRows.map((r) =>
          mapInsight(
            r,
            "campaign",
            r.campaign_id as string,
            campUuidByMeta.get(r.campaign_id as string) ?? null,
            accountUuid,
            currency,
            fxStr,
          ),
        ),
        ...acctRows.map((r) =>
          mapInsight(r, "account", actId, null, accountUuid, currency, fxStr),
        ),
      ];
      for (const v of rows) {
        if (summary.dateFrom == null || v.date < summary.dateFrom)
          summary.dateFrom = v.date;
        if (summary.dateTo == null || v.date > summary.dateTo)
          summary.dateTo = v.date;
      }
      summary.insightRows += await upsertInsights(db, rows);
    }

    await db
      .update(schema.syncRuns)
      .set({
        status: "success",
        finishedAt: new Date(),
        rowsUpserted: summary.insightRows,
        dateFrom: summary.dateFrom,
        dateTo: summary.dateTo,
      })
      .where(eq(schema.syncRuns.id, run.id));

    // System notifications for the oversight roles (deduped one-per-day).
    try {
      await generateSyncNotifications(db);
    } catch (e) {
      console.warn("[meta-sync] notification step failed (non-fatal):", (e as Error).message);
    }

    return summary;
  } catch (e) {
    await db
      .update(schema.syncRuns)
      .set({
        status: "failed",
        finishedAt: new Date(),
        error: (e as Error).message.slice(0, 2000),
      })
      .where(eq(schema.syncRuns.id, run.id));
    throw e;
  } finally {
    await sqlc.end({ timeout: 5 });
  }
}

/**
 * Insert deduped (one-per-day) system notifications for the oversight roles
 * (CEO + Head of Marketing): sync-done, plus creative-fatigue and high-burn
 * summaries. Runs on the owner connection (RLS-bypassing) at the end of a sync.
 */
async function generateSyncNotifications(
  db: ReturnType<typeof drizzle>,
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  const users = (await db.execute(sql`
    SELECT id FROM users
    WHERE status = 'active' AND role IN ('ceo', 'head_of_marketing')
  `)) as unknown as Array<{ id: string }>;
  if (!users.length) return;

  const fatigue = (await db.execute(sql`
    SELECT COUNT(*)::int AS c FROM (
      SELECT c.id,
        COALESCE(SUM(i.impressions),0)::float8 /
        NULLIF((SELECT MAX(reach) FROM insights_daily r
                WHERE r.campaign_id=c.id AND r.entity_type='campaign'),0) AS freq
      FROM campaigns c
      LEFT JOIN insights_daily i ON i.campaign_id=c.id AND i.entity_type='campaign'
      GROUP BY c.id
    ) x WHERE x.freq > 4
  `)) as unknown as Array<{ c: number }>;
  const fc = Number(fatigue[0]?.c) || 0;

  const burn = (await db.execute(sql`
    SELECT COUNT(*)::int AS c FROM (
      SELECT b.id,
        (COALESCE(ad.s,0)+COALESCE(m.a,0)) / NULLIF(b.budget_allocated,0) AS r
      FROM books b
      LEFT JOIN (SELECT c.book_id, SUM(i.spend*i.fx_rate) s FROM campaigns c
                 JOIN insights_daily i ON i.campaign_id=c.id AND i.entity_type='campaign'
                 GROUP BY c.book_id) ad ON ad.book_id=b.id
      LEFT JOIN (SELECT book_id, SUM(amount*fx_rate) a FROM spend_entries GROUP BY book_id) m
                 ON m.book_id=b.id
    ) x WHERE x.r > 0.9
  `)) as unknown as Array<{ c: number }>;
  const bc = Number(burn[0]?.c) || 0;

  const rows: (typeof schema.notifications.$inferInsert)[] = [];
  for (const u of users) {
    rows.push({
      userId: u.id,
      type: "sync",
      tone: "info",
      title: uz.alerts.syncOkTitle,
      body: uz.alerts.syncOkDesc,
      link: null,
      dedupeKey: `sync:${today}`,
    });
    if (fc > 0)
      rows.push({
        userId: u.id,
        type: "fatigue",
        tone: "warn",
        title: uz.alerts.fatigueTitle,
        body: uz.alerts.fatigueDesc.replace("{n}", String(fc)),
        link: "/dashboard/kampaniyalar",
        dedupeKey: `fatigue:${today}`,
      });
    if (bc > 0)
      rows.push({
        userId: u.id,
        type: "budget",
        tone: "warn",
        title: uz.alerts.burnTitle,
        body: uz.alerts.burnDesc.replace("{n}", String(bc)),
        link: "/dashboard/byudjetlar",
        dedupeKey: `budget:${today}`,
      });
  }

  if (rows.length)
    await db
      .insert(schema.notifications)
      .values(rows)
      .onConflictDoNothing({
        target: [schema.notifications.userId, schema.notifications.dedupeKey],
      });
}
