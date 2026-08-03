-- Authorization policy per the owner's decision: RESTRICTIONS APPLY ONLY TO
-- content_team. Every other role (ceo, head_of_marketing, pr_manager,
-- smm_manager) gets full access to the whole dashboard.
--
-- app_is_privileged() and the TS `isPrivileged` flag both read roles.is_privileged,
-- and that flag gates virtually every RLS policy and page/DAL guard. Marking
-- pr_manager and smm_manager privileged therefore opens all of them in one shot.
-- content_team stays is_privileged = false, so it remains limited to Creatives +
-- Tasks (and is redirected off the dashboard).
UPDATE roles SET is_privileged = true WHERE key IN ('pr_manager', 'smm_manager');
