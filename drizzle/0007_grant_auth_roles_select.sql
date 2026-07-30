-- The session resolver (getCurrentUser) reads users ⋈ roles over the auth
-- (BYPASSRLS) connection to compute privilege/role-label freshly per request.
-- falaq_auth was granted only the auth tables; give it READ-ONLY access to the
-- roles reference table (non-sensitive) so that join succeeds.
GRANT SELECT ON roles TO falaq_auth;
