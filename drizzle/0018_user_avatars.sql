-- Profile photos. Stored in a dedicated table (bytea) so the hot users query
-- stays small — users.image just holds a short URL (/api/avatar/<id>). Any
-- authenticated user may VIEW any avatar (they're shown across the app); a user
-- may only write their OWN.
CREATE TABLE IF NOT EXISTS user_avatars (
  user_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  mime text NOT NULL,
  data bytea NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint

ALTER TABLE user_avatars ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE user_avatars FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY user_avatars_select ON user_avatars FOR SELECT TO falaq_app
  USING (app_current_user_id() IS NOT NULL);
--> statement-breakpoint
CREATE POLICY user_avatars_insert ON user_avatars FOR INSERT TO falaq_app
  WITH CHECK (user_id = app_current_user_id());
--> statement-breakpoint
CREATE POLICY user_avatars_update ON user_avatars FOR UPDATE TO falaq_app
  USING (user_id = app_current_user_id())
  WITH CHECK (user_id = app_current_user_id());
--> statement-breakpoint
CREATE POLICY user_avatars_delete ON user_avatars FOR DELETE TO falaq_app
  USING (user_id = app_current_user_id());
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON user_avatars TO falaq_app;
