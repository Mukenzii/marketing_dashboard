#!/bin/bash
# Runs once on first container init (as POSTGRES_USER = falaq_owner).
# Creates the restricted runtime role. It is NOSUPERUSER + NOBYPASSRLS,
# so Row Level Security policies always apply to it. DDL/migrations run
# as the owner; the Next.js app connects only as this role.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  DO \$\$
  BEGIN
    -- Runtime role for the application: RLS ALWAYS applies to it.
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'falaq_app') THEN
      CREATE ROLE falaq_app WITH LOGIN PASSWORD '${APP_DB_PASSWORD}'
        NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
    END IF;
    -- Auth role for Better Auth only: BYPASSRLS, but granted ONLY the auth
    -- tables (see migration 0003), so bypass is harmless everywhere else.
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'falaq_auth') THEN
      CREATE ROLE falaq_auth WITH LOGIN PASSWORD '${AUTH_DB_PASSWORD}'
        NOSUPERUSER NOCREATEDB NOCREATEROLE BYPASSRLS;
    END IF;
  END
  \$\$;

  GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO falaq_app, falaq_auth;
  GRANT USAGE ON SCHEMA public TO falaq_app, falaq_auth;

  -- Future tables/sequences created by the owner grant CRUD to the app role.
  -- (falaq_auth is granted its four tables explicitly in migration 0003 — it
  -- deliberately gets NO blanket default privileges.)
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO falaq_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO falaq_app;
EOSQL
