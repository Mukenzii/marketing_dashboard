-- PR managers self-serve their own books. Two more tracker columns to match the
-- book-tracker sheet: previous-month sales (Sotuv iyun) and budget redirected to
-- another book (Target boshqa kitobga).

ALTER TABLE books ADD COLUMN IF NOT EXISTS sales_prev_month integer;
--> statement-breakpoint
ALTER TABLE books ADD COLUMN IF NOT EXISTS target_other_book numeric(14,2);
--> statement-breakpoint

-- Allow a PR manager to INSERT a book they own (owner_id = themselves). CEO /
-- Head of Marketing may still create for anyone (owner_id may be null/others).
DROP POLICY IF EXISTS books_insert ON books;
--> statement-breakpoint
CREATE POLICY books_insert ON books FOR INSERT TO falaq_app
  WITH CHECK (app_is_privileged() OR owner_id = app_current_user_id());
