import "server-only";

import { sql } from "drizzle-orm";
import { withUser } from "./with-user";
import { getCurrentUser } from "./context";
import { sumRaw, computeMetrics, type Metrics } from "@/lib/metrics";

export type DashboardKpis = {
  scope: "account" | "manager";
  spendUSD: number;
  spendUZS: number;
  impressions: number;
  clicks: number;
  leads: number;
  landingPageViews: number;
  reach: number;
  reachIsDeduped: boolean;
  metrics: Metrics;
  budgetUZS: number;
  totalCostUZS: number;
  remainingUZS: number;
  burnPct: number | null;
  bookCount: number;
  campaignCount: number;
};

/**
 * Headline KPIs for the current user's scope. Summable metrics come from
 * ad-level insights (source of truth). Reach is NOT summable over days or
 * children — for privileged users we use the account-level deduped figure; for
 * a manager (who can't see account rows) we fall back to the best available
 * campaign-level reach and flag it as non-deduped (`reachIsDeduped=false`).
 */
export async function getDashboardKpis(): Promise<DashboardKpis> {
  const user = await getCurrentUser();
  const privileged = !!user?.isPrivileged;

  return withUser(async (tx) => {
    const adRows = (await tx.execute(sql`
      SELECT i.spend, i.fx_rate, i.impressions, i.clicks, i.unique_clicks,
             i.inline_link_clicks, i.unique_inline_link_clicks,
             i.outbound_clicks, i.unique_outbound_clicks, i.landing_page_views,
             i.leads, i.video_3s_views, i.video_thruplay, i.purchases,
             i.purchase_value
      FROM insights_daily i
      WHERE i.entity_type = 'campaign'
    `)) as unknown as Array<Record<string, unknown>>;

    const agg = sumRaw(
      adRows.map((r) => ({
        spend: r.spend as string,
        fxRate: r.fx_rate as string,
        impressions: r.impressions as number,
        clicks: r.clicks as number,
        uniqueClicks: r.unique_clicks as number,
        inlineLinkClicks: r.inline_link_clicks as number,
        uniqueInlineLinkClicks: r.unique_inline_link_clicks as number,
        outboundClicks: r.outbound_clicks as number,
        uniqueOutboundClicks: r.unique_outbound_clicks as number,
        landingPageViews: r.landing_page_views as number,
        leads: r.leads as number,
        video3sViews: r.video_3s_views as number,
        videoThruplay: r.video_thruplay as number,
        purchaseValue: r.purchase_value as string,
      })),
    );

    // reach: peak deduped reach in the period at the best available level
    const reachRow = (await tx.execute(sql`
      SELECT COALESCE(MAX(reach), 0)::float8 AS reach
      FROM insights_daily
      WHERE entity_type = ${privileged ? "account" : "campaign"}
    `)) as unknown as Array<{ reach: number }>;
    const reach = Number(reachRow[0]?.reach) || 0;

    const budgetRow = (await tx.execute(sql`
      SELECT COUNT(*)::int AS book_count,
             COALESCE(SUM(budget_allocated), 0)::float8 AS budget_uzs
      FROM books
    `)) as unknown as Array<{ book_count: number; budget_uzs: number }>;

    const manualRow = (await tx.execute(sql`
      SELECT COALESCE(SUM(amount * fx_rate), 0)::float8 AS uzs FROM spend_entries
    `)) as unknown as Array<{ uzs: number }>;
    const campCountRow = (await tx.execute(sql`
      SELECT COUNT(*)::int AS c FROM campaigns
    `)) as unknown as Array<{ c: number }>;

    const budgetUZS = Number(budgetRow[0]?.budget_uzs) || 0;
    const manualUZS = Number(manualRow[0]?.uzs) || 0;
    const totalCostUZS = agg.spendUZS + manualUZS;

    return {
      scope: privileged ? "account" : "manager",
      spendUSD: agg.spend,
      spendUZS: agg.spendUZS,
      impressions: agg.impressions,
      clicks: agg.clicks,
      leads: agg.leads,
      landingPageViews: agg.landingPageViews,
      reach,
      reachIsDeduped: privileged,
      metrics: computeMetrics(agg, reach),
      budgetUZS,
      totalCostUZS,
      remainingUZS: budgetUZS - totalCostUZS,
      burnPct: budgetUZS ? (totalCostUZS / budgetUZS) * 100 : null,
      bookCount: Number(budgetRow[0]?.book_count) || 0,
      campaignCount: Number(campCountRow[0]?.c) || 0,
    };
  });
}
