# ─────────────────────────── deps ───────────────────────────
# Full dependency install (incl. dev deps: next, drizzle-kit, tsx).
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─────────────────────────── builder ─────────────────────────
# Compiles the Next.js standalone server bundle.
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Every route is dynamic (auth/headers), so nothing is rendered at build time.
# These placeholders only satisfy the DB clients' module-load env checks during
# `next build`; the real values are injected at runtime by compose/your host.
ENV DATABASE_URL=postgres://build:build@127.0.0.1:5432/build \
    DATABASE_URL_AUTH=postgres://build:build@127.0.0.1:5432/build \
    DATABASE_URL_MIGRATOR=postgres://build:build@127.0.0.1:5432/build \
    BETTER_AUTH_SECRET=build-time-placeholder-unused-at-runtime \
    BETTER_AUTH_URL=http://localhost:3000
RUN npm run build

# ─────────────────────────── tools ───────────────────────────
# One-shot maintenance image with full node_modules + source: runs drizzle
# migrations (migrator service) and the user seed scripts (seed service).
# See docker-compose. Default command applies migrations.
FROM node:22-alpine AS tools
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
CMD ["npm", "run", "db:migrate"]

# ─────────────────────────── runner ──────────────────────────
# Minimal runtime image — only the standalone server + static assets.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Run as an unprivileged user.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
# Lightweight liveness check against the app's own port.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/login').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
