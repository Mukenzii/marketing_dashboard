import "server-only";

import { auditLog } from "@/lib/db/schema";
import type { Tx } from "./with-user";

/**
 * Append an audit row INSIDE the caller's transaction — if the mutation rolls
 * back, so does the audit entry. audit_log is append-only (no update/delete
 * policy). Actor is the current GUC user.
 */
export async function writeAudit(
  tx: Tx,
  actorId: string,
  e: {
    action: string;
    entityType: string;
    entityId: string;
    oldValue?: unknown;
    newValue?: unknown;
  },
): Promise<void> {
  await tx.insert(auditLog).values({
    userId: actorId,
    action: e.action,
    entityType: e.entityType,
    entityId: e.entityId,
    oldValue: (e.oldValue ?? null) as never,
    newValue: (e.newValue ?? null) as never,
  });
}
