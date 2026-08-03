import "server-only";

import { sql } from "drizzle-orm";
import { withUser } from "./with-user";
import { sumRaw, computeMetrics, pacing, type Metrics } from "@/lib/metrics";

const rawFromRow = (r: Record<string, unknown>) => ({
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
});

export type CampaignRow = {
  id: string;
  name: string;
  bookTitle: string | null;
  objective: string | null;
  funnelStage: string | null;
  status: string | null;
  plannedBudgetUSD: number | null;
  spendUSD: number;
  spendUZS: number;
  impressions: number;
  reach: number;
  leads: number;
  metrics: Metrics;
  pacing: number | null;
};

export async function listCampaigns(): Promise<CampaignRow[]> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT c.id, c.name_raw, c.parsed_book_title, c.objective, c.status,
             c.funnel_stage, c.planned_budget, c.start_time, c.stop_time,
             b.title AS book_title,
             COALESCE(SUM(i.spend), 0) AS spend, MAX(i.fx_rate) AS fx_rate,
             COALESCE(SUM(i.impressions), 0) AS impressions,
             COALESCE(SUM(i.clicks), 0) AS clicks,
             COALESCE(SUM(i.unique_clicks), 0) AS unique_clicks,
             COALESCE(SUM(i.inline_link_clicks), 0) AS inline_link_clicks,
             COALESCE(SUM(i.unique_inline_link_clicks), 0) AS unique_inline_link_clicks,
             COALESCE(SUM(i.outbound_clicks), 0) AS outbound_clicks,
             COALESCE(SUM(i.unique_outbound_clicks), 0) AS unique_outbound_clicks,
             COALESCE(SUM(i.landing_page_views), 0) AS landing_page_views,
             COALESCE(SUM(i.leads), 0) AS leads,
             COALESCE(SUM(i.video_3s_views), 0) AS video_3s_views,
             COALESCE(SUM(i.video_thruplay), 0) AS video_thruplay,
             COALESCE(SUM(i.purchase_value), 0) AS purchase_value,
             COALESCE((SELECT MAX(reach) FROM insights_daily r
                       WHERE r.campaign_id = c.id AND r.entity_type='campaign'), 0) AS reach
      FROM campaigns c
      LEFT JOIN books b ON b.id = c.book_id
      LEFT JOIN insights_daily i ON i.campaign_id = c.id AND i.entity_type = 'campaign'
      GROUP BY c.id, b.title
      ORDER BY spend DESC
    `)) as unknown as Array<Record<string, unknown>>;

    const now = Date.now();
    return rows.map((r) => {
      const agg = sumRaw([rawFromRow(r)]);
      const reach = Number(r.reach) || 0;
      const planned = r.planned_budget ? Number(r.planned_budget) : null;
      // pacing: elapsed vs flight, actual spend vs planned budget
      let pace: number | null = null;
      if (planned && r.start_time && r.stop_time) {
        const start = new Date(r.start_time as string).getTime();
        const stop = new Date(r.stop_time as string).getTime();
        const flight = (stop - start) / 86400000;
        const elapsed = Math.max(0, (now - start) / 86400000);
        pace = pacing(agg.spend, planned, elapsed, flight);
      }
      return {
        id: String(r.id),
        name: (r.parsed_book_title as string) || String(r.name_raw),
        bookTitle: (r.book_title as string) ?? null,
        objective: (r.objective as string) ?? null,
        funnelStage: (r.funnel_stage as string) ?? null,
        status: (r.status as string) ?? null,
        plannedBudgetUSD: planned,
        spendUSD: agg.spend,
        spendUZS: agg.spendUZS,
        impressions: agg.impressions,
        reach,
        leads: agg.leads,
        metrics: computeMetrics(agg, reach),
        pacing: pace,
      };
    });
  });
}

export type CreativeRow = {
  id: string;
  name: string;
  campaignName: string | null;
  thumbnailUrl: string | null;
  spendUSD: number;
  impressions: number;
  frequency: number | null;
  hookRate: number | null;
  holdRate: number | null;
  ctr: number | null;
  cpm: number | null;
  fatigue: boolean;
};

/** Ad-level creative performance (HOOK/HOLD/CTR/CPM). frequency>4 = fatigue. */
export async function listCreatives(): Promise<CreativeRow[]> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT a.id, a.name, a.thumbnail_url,
             c.parsed_book_title, c.name_raw,
             COALESCE(SUM(i.spend),0) AS spend, MAX(i.fx_rate) AS fx_rate,
             COALESCE(SUM(i.impressions),0) AS impressions,
             COALESCE(SUM(i.clicks),0) AS clicks,
             COALESCE(SUM(i.inline_link_clicks),0) AS inline_link_clicks,
             COALESCE(SUM(i.unique_inline_link_clicks),0) AS unique_inline_link_clicks,
             COALESCE(SUM(i.unique_outbound_clicks),0) AS unique_outbound_clicks,
             COALESCE(SUM(i.landing_page_views),0) AS landing_page_views,
             COALESCE(SUM(i.leads),0) AS leads,
             COALESCE(SUM(i.video_3s_views),0) AS video_3s_views,
             COALESCE(SUM(i.video_thruplay),0) AS video_thruplay,
             COALESCE(SUM(i.purchase_value),0) AS purchase_value,
             COALESCE(MAX(i.reach),0) AS reach
      FROM ads a
      JOIN ad_sets s ON s.id = a.ad_set_id
      JOIN campaigns c ON c.id = s.campaign_id
      LEFT JOIN insights_daily i ON i.entity_id = a.meta_ad_id AND i.entity_type = 'ad'
      GROUP BY a.id, c.parsed_book_title, c.name_raw
      ORDER BY spend DESC
    `)) as unknown as Array<Record<string, unknown>>;

    return rows.map((r) => {
      const agg = sumRaw([rawFromRow({ ...r, unique_clicks: 0, outbound_clicks: 0 })]);
      const reach = Number(r.reach) || 0;
      const m = computeMetrics(agg, reach);
      return {
        id: String(r.id),
        name: String(r.name),
        campaignName:
          (r.parsed_book_title as string) || (r.name_raw as string) || null,
        thumbnailUrl: (r.thumbnail_url as string) ?? null,
        spendUSD: agg.spend,
        impressions: agg.impressions,
        frequency: m.frequency,
        hookRate: m.hookRate,
        holdRate: m.holdRate,
        ctr: m.ctr,
        cpm: m.cpm,
        fatigue: m.frequency != null && m.frequency > 4,
      };
    });
  });
}
