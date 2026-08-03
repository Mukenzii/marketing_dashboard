-- The dashboard aggregates spend (org-wide, via app_can_read_marketing) against
-- budget (summed from the books a user can SELECT). PR managers could only see
-- books they own, so their budget total was 0 while spend was org-wide — giving
-- a nonsensical negative "Qoldiq" (remaining = budget - spend) and an empty
-- percent.
--
-- Align book READ visibility with the marketing-read set: anyone who can read
-- the marketing dashboard can read all books (owners always see their own too).
-- WRITE stays restricted — books_insert / books_update remain owner-or-privileged,
-- so a PR manager still only adds and edits their own books.
DROP POLICY IF EXISTS books_select ON books;
--> statement-breakpoint
CREATE POLICY books_select ON books FOR SELECT TO falaq_app
  USING (app_can_read_marketing() OR owner_id = app_current_user_id());
