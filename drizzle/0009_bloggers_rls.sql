-- Bloggers: per-book blogger budgets, scoped through the owning book (mirrors
-- spend_entries). And relax books_update so a PR manager can maintain the
-- performance-tracker fields on their OWN books (previously CEO-only). Which
-- columns a manager may write is enforced in the DAL (tracker fields only).

GRANT SELECT, INSERT, UPDATE, DELETE ON bloggers TO falaq_app;
--> statement-breakpoint
ALTER TABLE bloggers ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE bloggers FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY bloggers_select ON bloggers FOR SELECT TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = bloggers.book_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
CREATE POLICY bloggers_insert ON bloggers FOR INSERT TO falaq_app
  WITH CHECK (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = bloggers.book_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
CREATE POLICY bloggers_update ON bloggers FOR UPDATE TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = bloggers.book_id AND b.owner_id = app_current_user_id()
    )
  )
  WITH CHECK (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = bloggers.book_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
CREATE POLICY bloggers_delete ON bloggers FOR DELETE TO falaq_app
  USING (
    app_is_privileged() OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.id = bloggers.book_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint
DROP POLICY IF EXISTS books_update ON books;
--> statement-breakpoint
CREATE POLICY books_update ON books FOR UPDATE TO falaq_app
  USING (app_is_privileged() OR owner_id = app_current_user_id())
  WITH CHECK (app_is_privileged() OR owner_id = app_current_user_id());
