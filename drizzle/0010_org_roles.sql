-- New org roles + a "read marketing" capability so SMM and content staff can
-- see campaigns/creatives (but NOT book budgets/spend — those stay
-- privileged-or-owner). Head of Marketing is privileged (sees & manages all);
-- account management is gated to the CEO at the app layer, not here.

INSERT INTO roles (key, name, description, is_privileged, sort_order) VALUES
  ('head_of_marketing', 'Marketing rahbari',
   'Barcha kitob, kampaniya va jamoani ko''radi va boshqaradi (hisoblardan tashqari).',
   true, 15),
  ('smm_manager', 'SMM menejer',
   'Kreativlar, kampaniya samaradorligi va o''ziga biriktirilgan vazifalar.',
   false, 30),
  ('content_team', 'Kontent jamoasi',
   'Kreativlar va o''ziga biriktirilgan vazifalar.',
   false, 40)
ON CONFLICT (key) DO NOTHING;
--> statement-breakpoint

-- TRUE for anyone allowed to read cross-book marketing data (campaigns, ad
-- sets, ads, insights): privileged roles + SMM + content team. PR managers are
-- intentionally excluded here — they stay scoped to books they own.
CREATE OR REPLACE FUNCTION app_can_read_marketing() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = app_current_user_id()
      AND u.status = 'active'
      AND u.role IN ('ceo', 'head_of_marketing', 'smm_manager', 'content_team')
  )
$$;
--> statement-breakpoint

DROP POLICY IF EXISTS campaigns_select ON campaigns;
--> statement-breakpoint
CREATE POLICY campaigns_select ON campaigns FOR SELECT TO falaq_app
  USING (
    app_can_read_marketing() OR (
      book_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM books b
        WHERE b.id = campaigns.book_id AND b.owner_id = app_current_user_id()
      )
    )
  );
--> statement-breakpoint

DROP POLICY IF EXISTS ad_sets_select ON ad_sets;
--> statement-breakpoint
CREATE POLICY ad_sets_select ON ad_sets FOR SELECT TO falaq_app
  USING (
    app_can_read_marketing() OR EXISTS (
      SELECT 1 FROM campaigns c
      JOIN books b ON b.id = c.book_id
      WHERE c.id = ad_sets.campaign_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint

DROP POLICY IF EXISTS ads_select ON ads;
--> statement-breakpoint
CREATE POLICY ads_select ON ads FOR SELECT TO falaq_app
  USING (
    app_can_read_marketing() OR EXISTS (
      SELECT 1 FROM ad_sets s
      JOIN campaigns c ON c.id = s.campaign_id
      JOIN books b ON b.id = c.book_id
      WHERE s.id = ads.ad_set_id AND b.owner_id = app_current_user_id()
    )
  );
--> statement-breakpoint

DROP POLICY IF EXISTS insights_select ON insights_daily;
--> statement-breakpoint
CREATE POLICY insights_select ON insights_daily FOR SELECT TO falaq_app
  USING (
    app_can_read_marketing() OR (
      campaign_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM campaigns c
        JOIN books b ON b.id = c.book_id
        WHERE c.id = insights_daily.campaign_id
          AND b.owner_id = app_current_user_id()
      )
    )
  );
