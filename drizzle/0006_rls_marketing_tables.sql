-- ===========================================================================
-- RLS for the marketing tables. Same convention as 0001/0003: ENABLE + FORCE,
-- policies TO falaq_app, scoped via app_is_privileged() OR an ownership check
-- using app_current_user_id(). Writes to the synced ad tables are privileged
-- only (the sync runs in a privileged system context).
--
-- Scope chain: campaigns.book_id -> books.owner_id. Everything beneath a
-- campaign (ad_sets, ads, insights_daily) scopes up through it. A campaign
-- with book_id IS NULL is visible to privileged users only — same as an
-- unassigned book. account-level insights rows (campaign_id NULL) likewise.
-- ===========================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON
  ad_accounts, campaigns, ad_sets, ads, insights_daily, sync_runs,
  tasks, task_comments, metric_thresholds
  TO falaq_app;
--> statement-breakpoint

-- ---------------------------------------------------------------- ad_accounts
-- Top-level account metadata: privileged only. Managers read currency from
-- insights_daily.currency, so they never need this table.
ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE ad_accounts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY ad_accounts_all ON ad_accounts FOR ALL TO falaq_app
  USING (app_is_privileged()) WITH CHECK (app_is_privileged());
--> statement-breakpoint

-- ------------------------------------------------------------------ campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE campaigns FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY campaigns_select ON campaigns FOR SELECT TO falaq_app
  USING (
    app_is_privileged() OR (
      book_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM books b
        WHERE b.id = campaigns.book_id AND b.owner_id = app_current_user_id()
      )
    )
  );
--> statement-breakpoint
CREATE POLICY campaigns_insert ON campaigns FOR INSERT TO falaq_app
  WITH CHECK (app_is_privileged());
--> statement-breakpoint
CREATE POLICY campaigns_update ON campaigns FOR UPDATE TO falaq_app
  USING (app_is_privileged()) WITH CHECK (app_is_privileged());
--> statement-breakpoint
CREATE POLICY campaigns_delete ON campaigns FOR DELETE TO falaq_app
  USING (app_is_privileged());
--> statement-breakpoint

-- -------------------------------------------------------------------- ad_sets
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE ad_sets FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY ad_sets_select ON ad_sets FOR SELECT TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM campaigns c
      JOIN books b ON b.id = c.book_id
      WHERE c.id = ad_sets.campaign_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
CREATE POLICY ad_sets_write ON ad_sets FOR ALL TO falaq_app
  USING (app_is_privileged()) WITH CHECK (app_is_privileged());
--> statement-breakpoint

-- ------------------------------------------------------------------------ ads
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE ads FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY ads_select ON ads FOR SELECT TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM ad_sets s
      JOIN campaigns c ON c.id = s.campaign_id
      JOIN books b ON b.id = c.book_id
      WHERE s.id = ads.ad_set_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
CREATE POLICY ads_write ON ads FOR ALL TO falaq_app
  USING (app_is_privileged()) WITH CHECK (app_is_privileged());
--> statement-breakpoint

-- -------------------------------------------------------------- insights_daily
ALTER TABLE insights_daily ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE insights_daily FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY insights_select ON insights_daily FOR SELECT TO falaq_app
  USING (
    app_is_privileged() OR (
      campaign_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM campaigns c
        JOIN books b ON b.id = c.book_id
        WHERE c.id = insights_daily.campaign_id
          AND b.owner_id = app_current_user_id()
      )
    )
  );
--> statement-breakpoint
CREATE POLICY insights_write ON insights_daily FOR ALL TO falaq_app
  USING (app_is_privileged()) WITH CHECK (app_is_privileged());
--> statement-breakpoint

-- -------------------------------------------------------------------- sync_runs
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE sync_runs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY sync_runs_all ON sync_runs FOR ALL TO falaq_app
  USING (app_is_privileged()) WITH CHECK (app_is_privileged());
--> statement-breakpoint

-- ------------------------------------------------------------------------ tasks
-- Visible to assignee, creator, or privileged.
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY tasks_select ON tasks FOR SELECT TO falaq_app
  USING (
    app_is_privileged()
    OR assignee_id = app_current_user_id()
    OR created_by = app_current_user_id()
  );
--> statement-breakpoint
CREATE POLICY tasks_insert ON tasks FOR INSERT TO falaq_app
  WITH CHECK (created_by = app_current_user_id());
--> statement-breakpoint
CREATE POLICY tasks_update ON tasks FOR UPDATE TO falaq_app
  USING (
    app_is_privileged()
    OR assignee_id = app_current_user_id()
    OR created_by = app_current_user_id()
  )
  WITH CHECK (
    app_is_privileged()
    OR assignee_id = app_current_user_id()
    OR created_by = app_current_user_id()
  );
--> statement-breakpoint
CREATE POLICY tasks_delete ON tasks FOR DELETE TO falaq_app
  USING (app_is_privileged() OR created_by = app_current_user_id());
--> statement-breakpoint

-- ---------------------------------------------------------------- task_comments
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE task_comments FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY task_comments_select ON task_comments FOR SELECT TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_comments.task_id
        AND (t.assignee_id = app_current_user_id()
             OR t.created_by = app_current_user_id())
    )
  );
--> statement-breakpoint
CREATE POLICY task_comments_insert ON task_comments FOR INSERT TO falaq_app
  WITH CHECK (
    user_id = app_current_user_id() AND (
      app_is_privileged() OR EXISTS (
        SELECT 1 FROM tasks t
        WHERE t.id = task_comments.task_id
          AND (t.assignee_id = app_current_user_id()
               OR t.created_by = app_current_user_id())
      )
    )
  );
--> statement-breakpoint
CREATE POLICY task_comments_delete ON task_comments FOR DELETE TO falaq_app
  USING (app_is_privileged() OR user_id = app_current_user_id());
--> statement-breakpoint

-- ------------------------------------------------------------- metric_thresholds
-- Readable by any authenticated user (badges render everywhere); writes privileged.
ALTER TABLE metric_thresholds ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE metric_thresholds FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY metric_thresholds_select ON metric_thresholds FOR SELECT TO falaq_app
  USING (app_current_user_id() IS NOT NULL);
--> statement-breakpoint
CREATE POLICY metric_thresholds_write ON metric_thresholds FOR ALL TO falaq_app
  USING (app_is_privileged()) WITH CHECK (app_is_privileged());
--> statement-breakpoint

-- Seed the one non-configurable default we already know (§7 fatigue rule).
-- Everything else is entered through the Sozlamalar (Settings) UI.
INSERT INTO metric_thresholds (metric_key, warn_above, alert_above)
VALUES ('frequency', 3, 4)
ON CONFLICT DO NOTHING;
