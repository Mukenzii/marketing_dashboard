import "server-only";

import { sql } from "drizzle-orm";
import { withUser } from "./with-user";
import {
  sumRaw,
  computeMetrics,
  badgeFor,
  type BadgeStatus,
  type Threshold,
} from "@/lib/metrics";

export type DayMetric = {
  key: string; // "overall" or ISO date
  label: string; // "Umumiy" or the date
  isOverall: boolean;
  spendUSD: number;
  spendUZS: number;
  impressions: number;
  reach: number;
  clicks: number;
  frequency: number | null;
  cpm: number | null;
  ctr: number | null; // ratio (0..1)
  hookRate: number | null;
  holdRate: number | null;
  status: Record<string, BadgeStatus>;
};

export type BookMetrics = {
  days: DayMetric[];
  delivery: string | null; // campaign status: ACTIVE / PAUSED / …
  hasData: boolean;
};

/** Map a DB insight row (snake_case) to the shape sumRaw() reads (camelCase). */
function toInsightRow(r: Record<string, unknown>) {
  return {
    spend: r.spend,
    fxRate: r.fx_rate,
    reach: r.reach,
    impressions: r.impressions,
    clicks: r.clicks,
    uniqueClicks: r.unique_clicks,
    inlineLinkClicks: r.inline_link_clicks,
    uniqueInlineLinkClicks: r.unique_inline_link_clicks,
    outboundClicks: r.outbound_clicks,
    uniqueOutboundClicks: r.unique_outbound_clicks,
    landingPageViews: r.landing_page_views,
    leads: r.leads,
    video3sViews: r.video_3s_views,
    videoThruplay: r.video_thruplay,
    videoP25: r.video_p25,
    videoP50: r.video_p50,
    videoP75: r.video_p75,
    videoP100: r.video_p100,
    purchases: r.purchases,
    purchaseValue: r.purchase_value,
  };
}

const numOr = (v: unknown): number => (v == null ? 0 : Number(v));

/**
 * Per-day marketing metrics for a book over the last `days` days, aggregated
 * across the book's campaigns (campaign-grain insights). RLS scopes this to the
 * owning PR manager (or privileged). Each metric carries an OK/Warn/Alert badge
 * derived from the configured metric_thresholds.
 */
export async function getBookDailyMetrics(
  bookId: string,
  days = 30,
): Promise<BookMetrics> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT i.date::text AS date, i.spend, i.fx_rate, i.reach, i.impressions,
             i.clicks, i.unique_clicks, i.inline_link_clicks,
             i.unique_inline_link_clicks, i.outbound_clicks,
             i.unique_outbound_clicks, i.landing_page_views, i.leads,
             i.video_3s_views, i.video_thruplay, i.video_p25, i.video_p50,
             i.video_p75, i.video_p100, i.purchases, i.purchase_value
      FROM insights_daily i
      JOIN campaigns c ON c.id = i.campaign_id
      WHERE c.book_id = ${bookId}
        AND i.entity_type = 'campaign'
        AND i.date >= (CURRENT_DATE - ${days}::int)
      ORDER BY i.date DESC
    `)) as unknown as Array<Record<string, unknown>>;

    // delivery status: is any campaign of this book still ACTIVE?
    const statusRows = (await tx.execute(sql`
      SELECT status FROM campaigns
      WHERE book_id = ${bookId} AND status IS NOT NULL
    `)) as unknown as Array<{ status: string }>;
    const delivery = statusRows.some((s) => s.status === "ACTIVE")
      ? "ACTIVE"
      : (statusRows[0]?.status ?? null);

    // thresholds → per-metric rule
    const thRows = (await tx.execute(sql`
      SELECT metric_key, warn_below, warn_above, alert_below, alert_above
      FROM metric_thresholds
    `)) as unknown as Array<Record<string, unknown>>;
    const thByKey = new Map<string, Threshold>();
    for (const t of thRows) {
      thByKey.set(String(t.metric_key).toLowerCase(), {
        warnBelow: t.warn_below == null ? null : Number(t.warn_below),
        warnAbove: t.warn_above == null ? null : Number(t.warn_above),
        alertBelow: t.alert_below == null ? null : Number(t.alert_below),
        alertAbove: t.alert_above == null ? null : Number(t.alert_above),
      });
    }

    // group rows by date
    const byDate = new Map<string, Record<string, unknown>[]>();
    for (const r of rows) {
      const d = String(r.date);
      (byDate.get(d) ?? byDate.set(d, []).get(d)!).push(r);
    }

    const build = (
      key: string,
      label: string,
      isOverall: boolean,
      group: Record<string, unknown>[],
    ): DayMetric => {
      const agg = sumRaw(
        group.map(toInsightRow) as unknown as Parameters<typeof sumRaw>[0],
      );
      const reach = group.reduce((a, r) => a + numOr(r.reach), 0);
      const m = computeMetrics(agg, reach);
      const status: Record<string, BadgeStatus> = {
        frequency: badgeFor(m.frequency, thByKey.get("frequency")),
        cpm: badgeFor(m.cpm, thByKey.get("cpm")),
        // ratios compared in percent so % thresholds read naturally
        ctr: badgeFor(m.ctr == null ? null : m.ctr * 100, thByKey.get("ctr")),
        hookRate: badgeFor(
          m.hookRate == null ? null : m.hookRate * 100,
          thByKey.get("hook") ?? thByKey.get("hook_rate"),
        ),
        holdRate: badgeFor(
          m.holdRate == null ? null : m.holdRate * 100,
          thByKey.get("hold") ?? thByKey.get("hold_rate"),
        ),
      };
      return {
        key,
        label,
        isOverall,
        spendUSD: agg.spend,
        spendUZS: agg.spendUZS,
        impressions: agg.impressions,
        reach,
        clicks: agg.clicks,
        frequency: m.frequency,
        cpm: m.cpm,
        ctr: m.ctr,
        hookRate: m.hookRate,
        holdRate: m.holdRate,
        status,
      };
    };

    const dates = [...byDate.keys()].sort((a, b) => (a < b ? 1 : -1)); // newest first
    const days_: DayMetric[] = [
      build("overall", "Umumiy", true, rows),
      ...dates.map((d) => build(d, d, false, byDate.get(d)!)),
    ];

    return { days: days_, delivery, hasData: rows.length > 0 };
  });
}
