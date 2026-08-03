-- The INSERT check on notifications depended on the app.user_id GUC, which is
-- not reliably visible during a nested drizzle insert inside a transaction
-- (task-assignment → notify). Notification rows are only ever created by the
-- server-only DAL, so INSERT is safe to allow unconditionally for falaq_app —
-- the sensitive operations (SELECT / UPDATE / DELETE) remain strictly
-- own-scoped via app_current_user_id().
DROP POLICY IF EXISTS notifications_insert ON notifications;
--> statement-breakpoint
CREATE POLICY notifications_insert ON notifications FOR INSERT TO falaq_app
  WITH CHECK (true);
