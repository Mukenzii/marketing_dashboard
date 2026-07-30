import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Dedicated connection for Better Auth, as the `falaq_auth` role (BYPASSRLS,
 * but granted ONLY users/sessions/accounts/verifications). Better Auth issues
 * queries with no `app.user_id` GUC set, so it could not run under the RLS on
 * users/accounts — hence its own bypass connection, scoped by grants to just
 * the auth tables. All application/domain data still goes through the
 * RLS-enforced `falaq_app` client (lib/db).
 */
const connectionString = process.env.DATABASE_URL_AUTH;
if (!connectionString) {
  throw new Error("DATABASE_URL_AUTH is not set");
}

const client = postgres(connectionString, { prepare: false });

export const authDb = drizzle(client, { schema });
