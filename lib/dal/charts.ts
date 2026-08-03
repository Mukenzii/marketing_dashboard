import "server-only";

import { sql } from "drizzle-orm";
import { withUser } from "./with-user";

/** Spend split (UZS) for the donut: Ads (Meta) / Blogger / Production. */
export async function getSpendSplit(): Promise<{
  ads: number;
  blogger: number;
  production: number;
}> {
  return withUser(async (tx) => {
    const ad = (await tx.execute(sql`
      SELECT COALESCE(SUM(i.spend * i.fx_rate), 0)::float8 AS uzs
      FROM insights_daily i WHERE i.entity_type = 'campaign'
    `)) as unknown as Array<{ uzs: number }>;
    const man = (await tx.execute(sql`
      SELECT type, COALESCE(SUM(amount * fx_rate), 0)::float8 AS uzs
      FROM spend_entries GROUP BY type
    `)) as unknown as Array<{ type: string; uzs: number }>;
    const get = (t: string) => Number(man.find((m) => m.type === t)?.uzs) || 0;
    return {
      ads: Number(ad[0]?.uzs) || 0,
      blogger: get("blogger"),
      production: get("production"),
    };
  });
}

/** Daily trend for the overview chart: spend (UZS), impressions, reach. */
export async function getSpendTrend(): Promise<
  Array<{ date: string; spendUZS: number; impressions: number; reach: number }>
> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT d.date::text AS date,
        COALESCE(a.spend_uzs, 0)::float8 AS spend_uzs,
        COALESCE(a.impressions, 0)::float8 AS impressions,
        COALESCE(r.reach, 0)::float8 AS reach
      FROM (SELECT DISTINCT date FROM insights_daily WHERE entity_type='campaign') d
      LEFT JOIN (
        SELECT date, SUM(spend * fx_rate) AS spend_uzs, SUM(impressions) AS impressions
        FROM insights_daily WHERE entity_type='campaign' GROUP BY date
      ) a ON a.date = d.date
      LEFT JOIN (
        SELECT date, MAX(reach) AS reach FROM insights_daily
        WHERE entity_type IN ('account','campaign') GROUP BY date
      ) r ON r.date = d.date
      ORDER BY d.date
    `)) as unknown as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      date: String(r.date),
      spendUZS: Number(r.spend_uzs) || 0,
      impressions: Number(r.impressions) || 0,
      reach: Number(r.reach) || 0,
    }));
  });
}

/** Books ranked by total spend (ad + blogger + production), UZS, with burn %. */
export async function getSpendByBook(): Promise<
  Array<{
    id: string;
    title: string;
    brand: "falaq_nashr" | "falaq_kids";
    spendUZS: number;
    burnPct: number | null;
  }>
> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT b.id, b.title, b.brand, b.budget_allocated::float8 AS budget,
        (COALESCE(ad.s,0) + COALESCE(bl.a,0) + COALESCE(pr.a,0))::float8 AS spend_uzs
      FROM books b
      LEFT JOIN (SELECT c.book_id, SUM(i.spend*i.fx_rate) s FROM campaigns c
                 JOIN insights_daily i ON i.campaign_id=c.id AND i.entity_type='campaign'
                 GROUP BY c.book_id) ad ON ad.book_id=b.id
      LEFT JOIN (SELECT book_id, SUM(amount*fx_rate) a FROM spend_entries
                 WHERE type='blogger' GROUP BY book_id) bl ON bl.book_id=b.id
      LEFT JOIN (SELECT book_id, SUM(amount*fx_rate) a FROM spend_entries
                 WHERE type='production' GROUP BY book_id) pr ON pr.book_id=b.id
      ORDER BY spend_uzs DESC
    `)) as unknown as Array<Record<string, unknown>>;
    return rows.map((r) => {
      const budget = Number(r.budget) || 0;
      const spendUZS = Number(r.spend_uzs) || 0;
      return {
        id: String(r.id),
        title: String(r.title),
        brand: r.brand as "falaq_nashr" | "falaq_kids",
        spendUZS,
        burnPct: budget ? (spendUZS / budget) * 100 : null,
      };
    });
  });
}
