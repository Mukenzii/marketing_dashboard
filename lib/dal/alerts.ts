import "server-only";

import { sql } from "drizzle-orm";
import { withUser } from "./with-user";
import { uz } from "@/lib/i18n/uz";

export type Alert = {
  id: string;
  tone: "alert" | "warn" | "info";
  title: string;
  desc: string;
};

/** Real, scoped alerts for the notification bell: overdue tasks, creative
 *  fatigue (freq>4), high burn, and sync health. */
export async function listAlerts(): Promise<Alert[]> {
  return withUser(async (tx) => {
    const alerts: Alert[] = [];

    const overdue = (await tx.execute(sql`
      SELECT COUNT(*)::int AS c FROM tasks
      WHERE status <> 'done' AND due_date < CURRENT_DATE
    `)) as unknown as Array<{ c: number }>;
    const oc = Number(overdue[0]?.c) || 0;
    if (oc > 0)
      alerts.push({
        id: "overdue",
        tone: "alert",
        title: uz.alerts.overdueTitle,
        desc: uz.alerts.overdueDesc.replace("{n}", String(oc)),
      });

    // creative fatigue: campaigns whose aggregate frequency (impr/dedup reach) > 4
    const fatigue = (await tx.execute(sql`
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
    if (fc > 0)
      alerts.push({
        id: "fatigue",
        tone: "warn",
        title: uz.alerts.fatigueTitle,
        desc: uz.alerts.fatigueDesc.replace("{n}", String(fc)),
      });

    // high burn books (>90% of budget spent)
    const burn = (await tx.execute(sql`
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
    if (bc > 0)
      alerts.push({
        id: "burn",
        tone: "warn",
        title: uz.alerts.burnTitle,
        desc: uz.alerts.burnDesc.replace("{n}", String(bc)),
      });

    // sync health (privileged only sees sync rows; managers get nothing here)
    const sync = (await tx.execute(sql`
      SELECT status, finished_at FROM sync_runs ORDER BY started_at DESC LIMIT 1
    `)) as unknown as Array<{ status: string; finished_at: string | null }>;
    if (sync[0]) {
      if (sync[0].status === "failed") {
        alerts.push({
          id: "sync",
          tone: "alert",
          title: uz.alerts.syncFailTitle,
          desc: uz.alerts.syncFailDesc,
        });
      } else {
        alerts.push({
          id: "sync",
          tone: "info",
          title: uz.alerts.syncOkTitle,
          desc: uz.alerts.syncOkDesc,
        });
      }
    }

    return alerts;
  });
}
