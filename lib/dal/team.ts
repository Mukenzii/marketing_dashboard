import "server-only";

import { sql } from "drizzle-orm";
import { withUser } from "./with-user";
import { requireCeoOrThrow } from "./context";
import { ratio } from "@/lib/metrics";

export type ManagerSummary = {
  id: string;
  name: string;
  email: string;
  bookCount: number;
  budgetUZS: number;
  spendUZS: number;
  burnPct: number | null;
  cpm: number | null;
  ctr: number | null;
  openTasks: number;
  overdueTasks: number;
};

/** Managers side by side. CEO only — enforced here, not just in the DAL scope. */
export async function listManagerSummaries(): Promise<ManagerSummary[]> {
  await requireCeoOrThrow();
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      WITH book_ad AS (
        SELECT b.id AS book_id, b.owner_id, b.budget_allocated::float8 AS budget,
               COALESCE(SUM(i.spend * i.fx_rate), 0) AS ad_uzs,
               COALESCE(SUM(i.spend), 0) AS ad_usd,
               COALESCE(SUM(i.impressions), 0) AS impressions,
               COALESCE(SUM(i.clicks), 0) AS clicks
        FROM books b
        LEFT JOIN campaigns c ON c.book_id = b.id
        LEFT JOIN insights_daily i
          ON i.campaign_id = c.id AND i.entity_type = 'ad'
        GROUP BY b.id
      ),
      man AS (
        SELECT bk.owner_id, SUM(se.amount * se.fx_rate) AS uzs
        FROM spend_entries se JOIN books bk ON bk.id = se.book_id
        GROUP BY bk.owner_id
      ),
      tk AS (
        SELECT assignee_id,
               COUNT(*) FILTER (WHERE status <> 'done') AS open_tasks,
               COUNT(*) FILTER (WHERE status <> 'done'
                                AND due_date < CURRENT_DATE) AS overdue_tasks
        FROM tasks GROUP BY assignee_id
      )
      SELECT u.id, u.name, u.email,
             COUNT(ba.book_id)::int AS book_count,
             COALESCE(SUM(ba.budget), 0)::float8 AS budget_uzs,
             COALESCE(SUM(ba.ad_uzs), 0)::float8 AS ad_spend_uzs,
             COALESCE(SUM(ba.ad_usd), 0)::float8 AS spend_usd,
             COALESCE(SUM(ba.impressions), 0)::float8 AS impressions,
             COALESCE(SUM(ba.clicks), 0)::float8 AS clicks,
             COALESCE(MAX(m.uzs), 0)::float8 AS manual_uzs,
             COALESCE(MAX(t.open_tasks), 0)::int AS open_tasks,
             COALESCE(MAX(t.overdue_tasks), 0)::int AS overdue_tasks
      FROM users u
      JOIN roles r ON r.key = u.role AND r.is_privileged = false
      LEFT JOIN book_ad ba ON ba.owner_id = u.id
      LEFT JOIN man m ON m.owner_id = u.id
      LEFT JOIN tk t ON t.assignee_id = u.id
      GROUP BY u.id, u.name, u.email
      ORDER BY u.name
    `)) as unknown as Array<Record<string, unknown>>;

    return rows.map((r) => {
      const budgetUZS = Number(r.budget_uzs) || 0;
      const spendUZS = (Number(r.ad_spend_uzs) || 0) + (Number(r.manual_uzs) || 0);
      const impressions = Number(r.impressions) || 0;
      const clicks = Number(r.clicks) || 0;
      const spendUSD = Number(r.spend_usd) || 0;
      return {
        id: String(r.id),
        name: String(r.name),
        email: String(r.email),
        bookCount: Number(r.book_count) || 0,
        budgetUZS,
        spendUZS,
        burnPct: budgetUZS ? (spendUZS / budgetUZS) * 100 : null,
        cpm: impressions ? (spendUSD / impressions) * 1000 : null,
        ctr: ratio(clicks, impressions),
        openTasks: Number(r.open_tasks) || 0,
        overdueTasks: Number(r.overdue_tasks) || 0,
      } satisfies ManagerSummary;
    });
  });
}
