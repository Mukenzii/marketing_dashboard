-- Per-user notification inbox. Users see & update ONLY their own rows.

CREATE TYPE notification_type AS ENUM ('task_assigned', 'fatigue', 'budget', 'sync', 'info');
--> statement-breakpoint

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'info',
  tone text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  dedupe_key text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint

CREATE INDEX notifications_user_idx ON notifications (user_id, is_read);
--> statement-breakpoint
CREATE UNIQUE INDEX notifications_user_dedupe_uq ON notifications (user_id, dedupe_key);
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO falaq_app;
--> statement-breakpoint

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Read/dismiss only your own. INSERT is allowed for any authenticated user so
-- the (server-only) DAL can notify a task's assignee — notification content is
-- controlled entirely by lib/dal, never by client input.
CREATE POLICY notifications_select ON notifications FOR SELECT TO falaq_app
  USING (user_id = app_current_user_id());
--> statement-breakpoint
CREATE POLICY notifications_insert ON notifications FOR INSERT TO falaq_app
  WITH CHECK (app_current_user_id() IS NOT NULL);
--> statement-breakpoint
CREATE POLICY notifications_update ON notifications FOR UPDATE TO falaq_app
  USING (user_id = app_current_user_id())
  WITH CHECK (user_id = app_current_user_id());
--> statement-breakpoint
CREATE POLICY notifications_delete ON notifications FOR DELETE TO falaq_app
  USING (user_id = app_current_user_id());
