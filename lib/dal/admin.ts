import "server-only";

import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { withUser } from "./with-user";
import {
  requireCeoOrThrow,
  requireCeoOnlyOrThrow,
  invalidateUser,
} from "./context";
import { ForbiddenError, NotFoundError } from "./errors";
import { authDb } from "@/lib/db/auth-client";
import { auth } from "@/lib/auth";
import {
  users,
  roles,
  sessions,
  books,
  metricThresholds,
} from "@/lib/db/schema";
import { writeAudit } from "./audit";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  status: "active" | "inactive";
  lastLoginAt: string | null;
  bookCount: number;
};

/** All users with role, status, last login, books assigned. CEO only. */
export async function listUsers(): Promise<AdminUserRow[]> {
  await requireCeoOrThrow();
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT u.id, u.name, u.email, u.role, u.status, u.last_login_at,
             r.name AS role_label,
             (SELECT COUNT(*) FROM books b WHERE b.owner_id = u.id)::int AS book_count
      FROM users u JOIN roles r ON r.key = u.role
      ORDER BY r.is_privileged DESC, u.name
    `)) as unknown as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      role: String(r.role),
      roleLabel: String(r.role_label),
      status: r.status as "active" | "inactive",
      lastLoginAt: (r.last_login_at as string) ?? null,
      bookCount: Number(r.book_count) || 0,
    }));
  });
}

export type AuditRow = {
  id: string;
  actorName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
};

/** Audit log (append-only). CEO only. Empty until mutations are logged. */
export async function listAudit(limit = 100): Promise<AuditRow[]> {
  await requireCeoOrThrow();
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT a.id, a.action, a.entity_type, a.entity_id, a.created_at,
             u.name AS actor_name
      FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT ${limit}
    `)) as unknown as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: String(r.id),
      actorName: (r.actor_name as string) ?? null,
      action: String(r.action),
      entityType: String(r.entity_type),
      entityId: (r.entity_id as string) ?? null,
      createdAt: String(r.created_at),
    }));
  });
}

export type ThresholdRow = {
  id: string;
  metricKey: string;
  objective: string | null;
  brand: string | null;
  warnBelow: number | null;
  warnAbove: number | null;
  alertBelow: number | null;
  alertAbove: number | null;
};

/** Metric threshold rules driving the OK/Warn/Alert badges. */
export async function listThresholds(): Promise<ThresholdRow[]> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT id, metric_key, objective, brand,
             warn_below, warn_above, alert_below, alert_above
      FROM metric_thresholds ORDER BY metric_key
    `)) as unknown as Array<Record<string, unknown>>;
    return rows.map((r) => ({
      id: String(r.id),
      metricKey: String(r.metric_key),
      objective: (r.objective as string) ?? null,
      brand: (r.brand as string) ?? null,
      warnBelow: r.warn_below == null ? null : Number(r.warn_below),
      warnAbove: r.warn_above == null ? null : Number(r.warn_above),
      alertBelow: r.alert_below == null ? null : Number(r.alert_below),
      alertAbove: r.alert_above == null ? null : Number(r.alert_above),
    }));
  });
}

export type SyncRunRow = {
  status: string;
  startedAt: string;
  finishedAt: string | null;
  rowsUpserted: number;
  dateFrom: string | null;
  dateTo: string | null;
  error: string | null;
};

/** Most recent Meta sync run (for the Sozlamalar status card). CEO only. */
export async function latestSyncRun(): Promise<SyncRunRow | null> {
  await requireCeoOrThrow();
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT status, started_at, finished_at, rows_upserted, date_from, date_to, error
      FROM sync_runs ORDER BY started_at DESC LIMIT 1
    `)) as unknown as Array<Record<string, unknown>>;
    if (!rows.length) return null;
    const r = rows[0];
    return {
      status: String(r.status),
      startedAt: new Date(r.started_at as string).toISOString(),
      finishedAt: r.finished_at
        ? new Date(r.finished_at as string).toISOString()
        : null,
      rowsUpserted: Number(r.rows_upserted) || 0,
      dateFrom: (r.date_from as string) ?? null,
      dateTo: (r.date_to as string) ?? null,
      error: (r.error as string) ?? null,
    };
  });
}

// --- Threshold mutations (CEO only; RLS also enforces app_is_privileged) ------

const numOrNull = z
  .union([z.number(), z.nan(), z.null()])
  .transform((v) => (v == null || Number.isNaN(v) ? null : v))
  .refine((v) => v == null || Number.isFinite(v), "Noto'g'ri son");

const Threshold = z
  .object({
    metricKey: z.string().trim().min(1).max(60),
    objective: z
      .string()
      .trim()
      .max(60)
      .optional()
      .transform((v) => (v ? v : null)),
    brand: z
      .enum(["falaq_nashr", "falaq_kids"])
      .nullish()
      .transform((v) => v ?? null),
    warnBelow: numOrNull,
    warnAbove: numOrNull,
    alertBelow: numOrNull,
    alertAbove: numOrNull,
  })
  .refine(
    (t) =>
      t.warnBelow != null ||
      t.warnAbove != null ||
      t.alertBelow != null ||
      t.alertAbove != null,
    { message: "Kamida bitta chegara qiymati kiritilishi kerak" },
  );

export type ThresholdInput = z.input<typeof Threshold>;

/** numeric columns take strings in drizzle; keep null as null. */
const numStr = (v: number | null): string | null => (v == null ? null : String(v));

/** Create a metric threshold rule. */
export async function createThreshold(
  input: ThresholdInput,
): Promise<{ id: string }> {
  const data = Threshold.parse(input);
  const ceo = await requireCeoOrThrow();

  return withUser(async (tx) => {
    let id: string;
    try {
      const [row] = await tx
        .insert(metricThresholds)
        .values({
          metricKey: data.metricKey,
          objective: data.objective,
          brand: data.brand,
          warnBelow: numStr(data.warnBelow),
          warnAbove: numStr(data.warnAbove),
          alertBelow: numStr(data.alertBelow),
          alertAbove: numStr(data.alertAbove),
        })
        .returning({ id: metricThresholds.id });
      id = row.id;
    } catch (e) {
      // 23505 = unique violation on (metric_key, objective, brand)
      if ((e as { code?: string }).code === "23505")
        throw new ForbiddenError(
          "Bu metrika, obyektiv va brend uchun chegara allaqachon mavjud",
        );
      throw e;
    }
    await writeAudit(tx, ceo.id, {
      action: "threshold.create",
      entityType: "threshold",
      entityId: id,
      newValue: data,
    });
    return { id };
  });
}

/** Update an existing threshold's bounds/scope. */
export async function updateThreshold(
  id: string,
  input: ThresholdInput,
): Promise<void> {
  z.string().uuid().parse(id);
  const data = Threshold.parse(input);
  const ceo = await requireCeoOrThrow();

  await withUser(async (tx) => {
    const res = await tx
      .update(metricThresholds)
      .set({
        metricKey: data.metricKey,
        objective: data.objective,
        brand: data.brand,
        warnBelow: numStr(data.warnBelow),
        warnAbove: numStr(data.warnAbove),
        alertBelow: numStr(data.alertBelow),
        alertAbove: numStr(data.alertAbove),
        updatedAt: new Date(),
      })
      .where(eq(metricThresholds.id, id));
    // RLS-blocked or missing row → nothing updated
    if ((res.count ?? 0) === 0) throw new NotFoundError("Chegara topilmadi");
    await writeAudit(tx, ceo.id, {
      action: "threshold.update",
      entityType: "threshold",
      entityId: id,
      newValue: data,
    });
  });
}

/** Delete a threshold rule. */
export async function deleteThreshold(id: string): Promise<void> {
  z.string().uuid().parse(id);
  const ceo = await requireCeoOrThrow();

  await withUser(async (tx) => {
    const res = await tx
      .delete(metricThresholds)
      .where(eq(metricThresholds.id, id));
    if ((res.count ?? 0) === 0) throw new NotFoundError("Chegara topilmadi");
    await writeAudit(tx, ceo.id, {
      action: "threshold.delete",
      entityType: "threshold",
      entityId: id,
    });
  });
}

/** All roles (for role selects). Readable by any authenticated user. */
export async function listRoles(): Promise<
  Array<{ key: string; name: string; isPrivileged: boolean }>
> {
  return withUser(async (tx) => {
    const rows = await tx
      .select({
        key: roles.key,
        name: roles.name,
        isPrivileged: roles.isPrivileged,
      })
      .from(roles)
      .orderBy(roles.sortOrder);
    return rows;
  });
}

/* -------------------------- user management (CEO) ------------------------- */

async function countActivePrivileged(): Promise<number> {
  const [r] = (await authDb
    .select({ c: sql<number>`count(*)::int` })
    .from(users)
    .innerJoin(roles, eq(roles.key, users.role))
    .where(and(eq(roles.isPrivileged, true), eq(users.status, "active")))) as {
    c: number;
  }[];
  return Number(r?.c) || 0;
}

export async function changeRole(
  userId: string,
  role: string,
): Promise<void> {
  z.string().min(1).parse(userId);
  z.string().min(1).parse(role);
  const ceo = await requireCeoOnlyOrThrow();

  if (userId === ceo.id)
    throw new ForbiddenError("O'z rolingizni o'zgartira olmaysiz");

  // reads via bypass conn to evaluate the last-privileged invariant safely
  const [target] = await authDb
    .select({ role: users.role, priv: roles.isPrivileged })
    .from(users)
    .innerJoin(roles, eq(roles.key, users.role))
    .where(eq(users.id, userId));
  if (!target) throw new NotFoundError();

  const [newRole] = await authDb
    .select({ priv: roles.isPrivileged })
    .from(roles)
    .where(eq(roles.key, role));
  if (!newRole) throw new NotFoundError("Rol topilmadi");

  if (target.priv && !newRole.priv && (await countActivePrivileged()) <= 1)
    throw new ForbiddenError("Kamida bitta CEO qolishi kerak");

  await withUser(async (tx) => {
    await tx
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId));
    await writeAudit(tx, ceo.id, {
      action: "user.changeRole",
      entityType: "user",
      entityId: userId,
      oldValue: { role: target.role },
      newValue: { role },
    });
  });
  invalidateUser(userId); // reflect the new role on their very next request
}

export async function setUserStatus(
  userId: string,
  status: "active" | "inactive",
): Promise<void> {
  z.enum(["active", "inactive"]).parse(status);
  const ceo = await requireCeoOnlyOrThrow();

  if (status === "inactive") {
    if (userId === ceo.id)
      throw new ForbiddenError("O'zingizni faolsizlantira olmaysiz");
    const [target] = await authDb
      .select({ priv: roles.isPrivileged })
      .from(users)
      .innerJoin(roles, eq(roles.key, users.role))
      .where(eq(users.id, userId));
    if (!target) throw new NotFoundError();
    if (target.priv && (await countActivePrivileged()) <= 1)
      throw new ForbiddenError("Oxirgi CEO'ni faolsizlantirib bo'lmaydi");
    // force logout: drop their sessions (auth conn)
    await authDb.delete(sessions).where(eq(sessions.userId, userId));
  }

  await withUser(async (tx) => {
    await tx
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId));
    await writeAudit(tx, ceo.id, {
      action: "user.setStatus",
      entityType: "user",
      entityId: userId,
      newValue: { status },
    });
  });
  invalidateUser(userId); // deactivation/reactivation takes effect immediately
}

export async function reassignBooks(
  fromUserId: string,
  toUserId: string | null,
): Promise<void> {
  const ceo = await requireCeoOnlyOrThrow();
  await withUser(async (tx) => {
    const res = await tx
      .update(books)
      .set({ ownerId: toUserId || null, updatedAt: new Date() })
      .where(eq(books.ownerId, fromUserId));
    await writeAudit(tx, ceo.id, {
      action: "user.reassignBooks",
      entityType: "user",
      entityId: fromUserId,
      newValue: { toUserId, moved: res.count ?? 0 },
    });
  });
}

const Invite = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  role: z.string().min(1),
});
export type InviteInput = z.input<typeof Invite>;

/** Create an account-less user and return a set-password (invite) link. */
export async function inviteUser(
  input: InviteInput,
): Promise<{ id: string }> {
  const data = Invite.parse(input);
  const ceo = await requireCeoOnlyOrThrow();

  const existing = await authDb
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email));
  if (existing.length)
    throw new ForbiddenError("Bu email allaqachon mavjud");

  const id = crypto.randomUUID();
  await authDb.insert(users).values({
    id,
    name: data.name,
    email: data.email,
    emailVerified: false,
    role: data.role,
    status: "active",
  });

  // issue a set-password link (dev: logged to console by lib/auth)
  await auth.api.requestPasswordReset({
    body: { email: data.email, redirectTo: "/reset-password" },
  });

  await withUser(async (tx) => {
    await writeAudit(tx, ceo.id, {
      action: "user.invite",
      entityType: "user",
      entityId: id,
      newValue: { email: data.email, role: data.role },
    });
  });
  return { id };
}

