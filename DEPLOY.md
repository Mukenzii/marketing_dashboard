# Deploying Falaq Dashboard

Production stack: **Next.js standalone server** + **Postgres**, orchestrated by
`docker-compose.yml`. Three roles enforce least privilege — `falaq_app`
(RLS-enforced runtime), `falaq_auth` (auth tables only), `falaq_owner` (DDL /
migrations).

## 1. Configure secrets

```bash
cp .env.docker.example .env
./scripts/gen-secrets.sh >> .env    # strong random DB passwords + auth secret
```

Then edit `.env`:

- `BETTER_AUTH_URL` — your real public URL. **Use `https://` in production** —
  it turns on secure cookies and is the CSRF trusted origin.
- `TRUSTED_ORIGINS` — any extra origins allowed to drive auth (comma-separated).
- `META_*` — optional; leave blank to keep using fixtures.

Never commit `.env` (it is gitignored; only `*.example` is tracked).

## 2. Bring up the stack

```bash
docker compose up -d --build
```

Order is handled automatically:

1. `db` starts and passes its healthcheck.
2. `migrator` runs `drizzle-kit migrate` (as `falaq_owner`) and exits.
3. `app` starts only after migrations complete, on port **3000**.

Seed the first users (once):

```bash
docker compose run --rm migrator npm run db:seed
```

## 3. Front it with HTTPS

Run a TLS terminator (Caddy, nginx, or your cloud LB) in front of `app:3000`.
The app already sends HSTS, a strict CSP, `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, and a locked-down `Permissions-Policy`.

## Operations

| Task | Command |
|------|---------|
| Apply new migrations | `docker compose run --rm migrator npm run db:migrate` |
| Tail app logs | `docker compose logs -f app` |
| Rebuild after code change | `docker compose up -d --build app` |
| Stop everything | `docker compose down` |

## Security & performance notes

- **SQL injection**: all queries use parameterized Drizzle `sql` templates — no
  string concatenation, no `sql.raw`/`unsafe`.
- **RLS**: every domain table is `FORCE ROW LEVEL SECURITY`; the runtime role
  cannot bypass it. `app.user_id` is set per-transaction.
- **Auth**: sessions are cookie-cached (fewer DB reads), auth endpoints are
  rate-limited (sign-in 5/min), cookies are `HttpOnly` + `Secure` (prod).
- **User privileges** are cached for `USER_CACHE_TTL_MS` (default 20s); admin
  role/status changes invalidate the cache immediately.
- **Pool sizing**: tune `DB_POOL_MAX` (app) / `DB_AUTH_POOL_MAX` per instance so
  `instances × pool ≤ Postgres max_connections`.
