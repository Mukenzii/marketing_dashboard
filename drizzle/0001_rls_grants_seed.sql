-- ===========================================================================
-- Row Level Security, runtime grants, and role seed.
--
-- Scope is keyed off two transaction-local GUCs the DAL sets via SET LOCAL:
--   app.user_id  -> the authenticated user's id
--   app.role     -> that user's role key
-- With no GUC set (any query outside a withUser() transaction) the helpers
-- return NULL/false and every policy denies — fail closed.
--
-- Privilege is read from roles.is_privileged, so adding a third privileged role
-- is an INSERT into roles, never a policy change.
-- ===========================================================================

-- --- helper functions -------------------------------------------------------
CREATE OR REPLACE FUNCTION app_current_user_id() RETURNS text
  LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.user_id', true), '')
$$;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION app_is_privileged() RETURNS boolean
  LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM roles r
    WHERE r.key = nullif(current_setting('app.role', true), '')
      AND r.is_privileged
  )
$$;
--> statement-breakpoint

-- --- runtime grants for the restricted app role -----------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON
  users, sessions, accounts, verifications, roles,
  books, spend_entries, results, audit_log
  TO falaq_app;
--> statement-breakpoint

-- ===========================================================================
-- books
-- ===========================================================================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE books FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY books_select ON books FOR SELECT TO falaq_app
  USING (app_is_privileged() OR owner_id = app_current_user_id());
--> statement-breakpoint
CREATE POLICY books_insert ON books FOR INSERT TO falaq_app
  WITH CHECK (app_is_privileged());
--> statement-breakpoint
CREATE POLICY books_update ON books FOR UPDATE TO falaq_app
  USING (app_is_privileged())
  WITH CHECK (app_is_privileged());
--> statement-breakpoint
CREATE POLICY books_delete ON books FOR DELETE TO falaq_app
  USING (app_is_privileged());
--> statement-breakpoint

-- ===========================================================================
-- spend_entries (scoped through the owning book)
-- ===========================================================================
ALTER TABLE spend_entries ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE spend_entries FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY spend_select ON spend_entries FOR SELECT TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = spend_entries.book_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
CREATE POLICY spend_insert ON spend_entries FOR INSERT TO falaq_app
  WITH CHECK (
    app_is_privileged() OR (
      created_by = app_current_user_id()
      AND EXISTS (
        SELECT 1 FROM books b
        WHERE b.id = spend_entries.book_id AND b.owner_id = app_current_user_id()
      )
    )
  );
--> statement-breakpoint
CREATE POLICY spend_update ON spend_entries FOR UPDATE TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = spend_entries.book_id AND b.owner_id = app_current_user_id()
    )
  )
  WITH CHECK (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = spend_entries.book_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
-- managers: delete only entries they created, on their own book, within 24h.
CREATE POLICY spend_delete ON spend_entries FOR DELETE TO falaq_app
  USING (
    app_is_privileged() OR (
      created_by = app_current_user_id()
      AND created_at > now() - interval '24 hours'
      AND EXISTS (
        SELECT 1 FROM books b
        WHERE b.id = spend_entries.book_id AND b.owner_id = app_current_user_id()
      )
    )
  );
--> statement-breakpoint

-- ===========================================================================
-- results (scoped through the owning book)
-- ===========================================================================
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE results FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY results_select ON results FOR SELECT TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = results.book_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
CREATE POLICY results_insert ON results FOR INSERT TO falaq_app
  WITH CHECK (
    app_is_privileged() OR (
      created_by = app_current_user_id()
      AND EXISTS (
        SELECT 1 FROM books b
        WHERE b.id = results.book_id AND b.owner_id = app_current_user_id()
      )
    )
  );
--> statement-breakpoint
CREATE POLICY results_update ON results FOR UPDATE TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = results.book_id AND b.owner_id = app_current_user_id()
    )
  )
  WITH CHECK (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = results.book_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
CREATE POLICY results_delete ON results FOR DELETE TO falaq_app
  USING (
    app_is_privileged() OR (
      created_by = app_current_user_id()
      AND created_at > now() - interval '24 hours'
      AND EXISTS (
        SELECT 1 FROM books b
        WHERE b.id = results.book_id AND b.owner_id = app_current_user_id()
      )
    )
  );
--> statement-breakpoint

-- ===========================================================================
-- role seed (extensible — a third role is another row here)
-- ===========================================================================
INSERT INTO roles (key, name, description, is_privileged, sort_order) VALUES
  ('pr_manager', 'PR Manager', 'Owns and manages their assigned books.', false, 10),
  ('ceo', 'CEO', 'Full access to all managers, books, budgets, and users.', true, 20)
ON CONFLICT (key) DO NOTHING;
