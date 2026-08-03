import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Drizzle client, connected as the restricted `falaq_app` role so Postgres RLS
 * is always in force. `prepare: false` keeps statements on one pinned
 * connection per transaction, which is what `SET LOCAL` (lib/dal) needs.
 *
 * This module has NO `server-only` guard so it can also be imported by node
 * scripts (seed) and the Better Auth config. App and DAL code should import
 * from `@/lib/db` instead, which re-exports this behind the guard.
 */
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Cache the pool on globalThis so Next.js HMR (dev) and repeated module
// evaluation (prod) reuse ONE pool instead of leaking a fresh one — which would
// exhaust Postgres connections.
const g = globalThis as unknown as {
  __falaqAppClient?: ReturnType<typeof postgres>;
};
const client =
  g.__falaqAppClient ??
  postgres(connectionString, {
    prepare: false, // required: keeps each tx on one pinned conn for SET LOCAL
    max: Number(process.env.DB_POOL_MAX ?? 10),
    idle_timeout: 20, // release idle connections after 20s
    connect_timeout: 10, // fail fast when the DB is unreachable
    max_lifetime: 60 * 30, // recycle a connection after 30 min
  });
g.__falaqAppClient = client;

export const db = drizzle(client, { schema });
export { schema };
export type Db = typeof db;
