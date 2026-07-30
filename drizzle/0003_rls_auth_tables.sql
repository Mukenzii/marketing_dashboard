-- ===========================================================================
-- RLS on users, accounts, roles, audit_log — and the falaq_auth grants.
--
-- accounts.password holds every credential hash; the app role must never be
-- able to read another user's row. Better Auth needs unrestricted access to
-- the auth tables, so it runs as falaq_auth (BYPASSRLS) which is granted ONLY
-- these four tables — bypass is therefore harmless on the domain tables.
-- ===========================================================================

-- --- falaq_auth: only the auth tables -------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON users, sessions, accounts, verifications
  TO falaq_auth;
--> statement-breakpoint

-- ===========================================================================
-- users — see self; only the privileged manage others
-- ===========================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE users FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY users_select ON users FOR SELECT TO falaq_app
  USING (app_is_privileged() OR id = app_current_user_id());
--> statement-breakpoint
CREATE POLICY users_insert ON users FOR INSERT TO falaq_app
  WITH CHECK (app_is_privileged());
--> statement-breakpoint
CREATE POLICY users_update ON users FOR UPDATE TO falaq_app
  USING (app_is_privileged()) WITH CHECK (app_is_privileged());
--> statement-breakpoint
CREATE POLICY users_delete ON users FOR DELETE TO falaq_app
  USING (app_is_privileged());
--> statement-breakpoint

-- ===========================================================================
-- accounts — own row only; NEVER privileged-readable (password hashes)
-- ===========================================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE accounts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY accounts_select ON accounts FOR SELECT TO falaq_app
  USING (user_id = app_current_user_id());
--> statement-breakpoint
CREATE POLICY accounts_update ON accounts FOR UPDATE TO falaq_app
  USING (user_id = app_current_user_id())
  WITH CHECK (user_id = app_current_user_id());
--> statement-breakpoint
-- no INSERT/DELETE policy for falaq_app → denied (auth writes go via falaq_auth)

-- ===========================================================================
-- roles — readable by any authenticated user; writes privileged only
-- ===========================================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE roles FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY roles_select ON roles FOR SELECT TO falaq_app
  USING (app_current_user_id() IS NOT NULL);
--> statement-breakpoint
CREATE POLICY roles_insert ON roles FOR INSERT TO falaq_app
  WITH CHECK (app_is_privileged());
--> statement-breakpoint
CREATE POLICY roles_update ON roles FOR UPDATE TO falaq_app
  USING (app_is_privileged()) WITH CHECK (app_is_privileged());
--> statement-breakpoint
CREATE POLICY roles_delete ON roles FOR DELETE TO falaq_app
  USING (app_is_privileged());
--> statement-breakpoint

-- ===========================================================================
-- audit_log — privileged read; append-only (any authenticated actor inserts;
-- NO update/delete policy exists, so rows can never be altered or removed)
-- ===========================================================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit_log FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY audit_select ON audit_log FOR SELECT TO falaq_app
  USING (app_is_privileged());
--> statement-breakpoint
CREATE POLICY audit_insert ON audit_log FOR INSERT TO falaq_app
  WITH CHECK (app_current_user_id() IS NOT NULL);
