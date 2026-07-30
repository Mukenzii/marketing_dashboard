import "server-only";

import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { requireUser } from "./context";

// The transaction handle Drizzle passes to the callback.
export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Run `fn` inside a transaction whose FIRST statement pins the RLS GUC to the
 * CURRENT user. The user id comes from the session (requireUser) — never a
 * caller argument, so it can't be spoofed. `set_config(..., true)` is
 * transaction-local AND parameterized (no SQL-injection surface, unlike
 * `SET LOCAL app.user_id = '…'`). `prepare:false` on the client keeps the whole
 * transaction on one pinned connection, which is what SET LOCAL requires.
 */
export async function withUser<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const user = await requireUser();
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.user_id', ${user.id}, true)`);
    return fn(tx);
  });
}

/** SEED / TEST ONLY — sets the GUC to an explicit id. Never call from app code. */
export async function withUserId<T>(
  userId: string,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.user_id', ${userId}, true)`);
    return fn(tx);
  });
}
