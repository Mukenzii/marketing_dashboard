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

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export { schema };
export type Db = typeof db;
