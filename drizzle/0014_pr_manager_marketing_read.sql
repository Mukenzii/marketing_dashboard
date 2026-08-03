-- PR managers can now see the full marketing dashboard (spend KPIs, trend,
-- split, top campaigns). Previously app_can_read_marketing() excluded them, so
-- a PR manager only saw campaigns linked to books they personally own — which
-- left the dashboard empty for anyone who owns no linked books.
--
-- Adding pr_manager here grants org-wide READ on the marketing tables
-- (campaigns / ad_sets / ads / insights). Page-level guards still decide which
-- pages each role can open; the dashboard route already redirects content_team.
CREATE OR REPLACE FUNCTION app_can_read_marketing() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = app_current_user_id()
      AND u.status = 'active'
      AND u.role IN ('ceo', 'head_of_marketing', 'smm_manager', 'content_team', 'pr_manager')
  )
$$;
