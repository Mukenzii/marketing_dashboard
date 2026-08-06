import "server-only";

import { eq, sql } from "drizzle-orm";

import { withUser } from "./with-user";
import { requireUser, invalidateUser } from "./context";
import { authDb } from "@/lib/db/auth-client";
import { users } from "@/lib/db/schema";

const MAX_BYTES = 2_000_000; // ~2 MB (images are resized client-side first)
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Store the current user's avatar. Bytes go in `user_avatars` (own row, RLS);
 * `users.image` is pointed at the cache-busted avatar route. Everything here is
 * async — no blocking/sync file or buffer work.
 */
export async function uploadAvatar(bytes: Buffer, mime: string): Promise<void> {
  const user = await requireUser();

  if (!ALLOWED_MIME.has(mime))
    throw new Error("Faqat JPEG, PNG yoki WebP rasm yuklash mumkin.");
  if (bytes.length === 0) throw new Error("Bo'sh fayl.");
  if (bytes.length > MAX_BYTES) throw new Error("Rasm hajmi juda katta (max 2MB).");

  await withUser(async (tx) => {
    await tx.execute(sql`
      INSERT INTO user_avatars (user_id, mime, data, updated_at)
      VALUES (${user.id}, ${mime}, ${bytes}, now())
      ON CONFLICT (user_id) DO UPDATE
        SET mime = excluded.mime, data = excluded.data, updated_at = now()
    `);
  });

  // users has RLS (privileged-only UPDATE) — write via the auth connection,
  // scoped to the caller's own id. `?v=` busts the browser/CDN cache.
  const url = `/api/avatar/${user.id}?v=${Date.now()}`;
  await authDb.update(users).set({ image: url }).where(eq(users.id, user.id));
  invalidateUser(user.id);
}

/** Remove the current user's avatar. */
export async function removeAvatar(): Promise<void> {
  const user = await requireUser();
  await withUser(async (tx) => {
    await tx.execute(sql`DELETE FROM user_avatars WHERE user_id = ${user.id}`);
  });
  await authDb.update(users).set({ image: null }).where(eq(users.id, user.id));
  invalidateUser(user.id);
}

/** Read an avatar's raw bytes (for the /api/avatar route). */
export async function getAvatar(
  userId: string,
): Promise<{ data: Buffer; mime: string } | null> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT mime, data FROM user_avatars WHERE user_id = ${userId}
    `)) as unknown as Array<{ mime: string; data: Buffer }>;
    const r = rows[0];
    return r ? { data: Buffer.from(r.data), mime: r.mime } : null;
  });
}
