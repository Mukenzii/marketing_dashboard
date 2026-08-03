import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { withUser, type Tx } from "./with-user";
import { requireUser } from "./context";
import { notifications } from "@/lib/db/schema";

/** Shape consumed by the notification bell (see notification-dropdown.tsx). */
export type NotifyItem = {
  id: string;
  tone: "alert" | "warn" | "info";
  title: string;
  desc: string;
  link: string | null;
};

/** Current user's UNREAD notifications, newest first. */
export async function listNotifications(limit = 20): Promise<NotifyItem[]> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT id, tone, title, body, link
      FROM notifications
      WHERE user_id = app_current_user_id() AND is_read = false
      ORDER BY created_at DESC
      LIMIT ${limit}
    `)) as unknown as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: String(r.id),
      tone: (r.tone as NotifyItem["tone"]) ?? "info",
      title: String(r.title),
      desc: (r.body as string) ?? "",
      link: (r.link as string) ?? null,
    }));
  });
}

/** Mark every notification of the current user as read (empties the bell). */
export async function markAllRead(): Promise<void> {
  await requireUser();
  await withUser(async (tx) => {
    await tx
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, sql`app_current_user_id()`),
          eq(notifications.isRead, false),
        ),
      );
  });
}

/** Mark a single notification (own) as read. */
export async function markRead(id: string): Promise<void> {
  await requireUser();
  await withUser(async (tx) => {
    await tx
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  });
}

export type NotifyInput = {
  userId: string;
  type: "task_assigned" | "fatigue" | "budget" | "sync" | "info";
  tone: "alert" | "warn" | "info";
  title: string;
  body?: string | null;
  link?: string | null;
  dedupeKey?: string | null;
};

/**
 * Insert a notification for `userId` inside an existing transaction. Deduped on
 * (user_id, dedupe_key): a NULL key is always inserted (task events), a set key
 * is inserted at most once (system alerts) via ON CONFLICT DO NOTHING.
 */
export async function notify(tx: Tx, input: NotifyInput): Promise<void> {
  const q = tx.insert(notifications).values({
    userId: input.userId,
    type: input.type,
    tone: input.tone,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
    dedupeKey: input.dedupeKey ?? null,
  });
  // ON CONFLICT trips forced RLS on this table, so only add it when a dedupe
  // key is actually set (system notifications, which run on the bypass
  // connection anyway). Task assignments have no key → plain insert.
  if (input.dedupeKey) {
    await q.onConflictDoNothing({
      target: [notifications.userId, notifications.dedupeKey],
    });
  } else {
    await q;
  }
}
