-- ===========================================================================
-- Harden app_is_privileged(): derive privilege from the user id ALONE, read
-- from the database — never from a client-supplied app.role GUC.
--
-- Why: the old version trusted current_setting('app.role'). That meant two
-- GUCs had to be correct, a stale GUC kept a demoted CEO privileged for the
-- rest of their session, and any path that set app.role from a session token
-- (rather than the DB) became a privilege-escalation surface. Now the DAL sets
-- exactly one GUC (app.user_id) and privilege is always the current DB truth.
--
-- SECURITY DEFINER (owned by the superuser) so the function's own reads of
-- users/roles bypass RLS — this is what prevents infinite recursion once RLS
-- is enabled on users (migration 0003), where the users policy calls this fn.
-- ===========================================================================
CREATE OR REPLACE FUNCTION app_is_privileged() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users u
    JOIN roles r ON r.key = u.role
    WHERE u.id = app_current_user_id()
      AND u.status = 'active'
      AND r.is_privileged
  )
$$;
