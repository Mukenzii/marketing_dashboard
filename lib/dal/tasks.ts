import "server-only";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { withUser } from "./with-user";
import { requireUser } from "./context";
import { NotFoundError, ForbiddenError } from "./errors";
import { tasks } from "@/lib/db/schema";
import { writeAudit } from "./audit";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "review" | "done" | "blocked";
  priority: "low" | "normal" | "high";
  dueDate: string | null;
  completedAt: string | null;
  bookId: string | null;
  bookTitle: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  isOverdue: boolean;
};

/** Tasks visible to the current user (assignee, creator, or privileged — RLS). */
export async function listTasks(): Promise<TaskRow[]> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT t.id, t.title, t.description, t.status, t.priority,
             t.due_date, t.completed_at, t.book_id,
             b.title AS book_title, t.assignee_id, u.name AS assignee_name
      FROM tasks t
      LEFT JOIN books b ON b.id = t.book_id
      LEFT JOIN users u ON u.id = t.assignee_id
      ORDER BY
        CASE t.status WHEN 'blocked' THEN 0 WHEN 'in_progress' THEN 1
             WHEN 'todo' THEN 2 WHEN 'review' THEN 3 ELSE 4 END,
        t.due_date NULLS LAST
    `)) as unknown as Array<Record<string, unknown>>;

    const today = new Date().toISOString().slice(0, 10);
    return rows.map((r) => {
      const due = (r.due_date as string) ?? null;
      const status = r.status as TaskRow["status"];
      return {
        id: String(r.id),
        title: String(r.title),
        description: (r.description as string) ?? null,
        status,
        priority: r.priority as TaskRow["priority"],
        dueDate: due,
        completedAt: (r.completed_at as string) ?? null,
        bookId: (r.book_id as string) ?? null,
        bookTitle: (r.book_title as string) ?? null,
        assigneeId: (r.assignee_id as string) ?? null,
        assigneeName: (r.assignee_name as string) ?? null,
        isOverdue: !!due && due < today && status !== "done",
      };
    });
  });
}

/* -------------------------------- mutations ------------------------------- */

const STATUSES = ["todo", "in_progress", "review", "done", "blocked"] as const;
const TaskInput = z.object({
  title: z.string().trim().min(1, "Sarlavha shart").max(200),
  description: z.string().trim().max(2000).optional(),
  bookId: z.string().uuid().optional().or(z.literal("")),
  assigneeId: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  status: z.enum(STATUSES).default("todo"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
});
export type TaskInput = z.input<typeof TaskInput>;

export async function createTask(input: TaskInput): Promise<{ id: string }> {
  const data = TaskInput.parse(input);
  const user = await requireUser();
  return withUser(async (tx) => {
    const [row] = await tx
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description || null,
        bookId: data.bookId || null,
        assigneeId: data.assigneeId || user.id,
        createdBy: user.id,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate || null,
      })
      .returning({ id: tasks.id });
    await writeAudit(tx, user.id, {
      action: "task.create",
      entityType: "task",
      entityId: row.id,
      newValue: data,
    });
    return { id: row.id };
  });
}

export async function updateTaskStatus(
  id: string,
  status: (typeof STATUSES)[number],
): Promise<void> {
  z.enum(STATUSES).parse(status);
  const user = await requireUser();
  return withUser(async (tx) => {
    const [old] = await tx.select().from(tasks).where(eq(tasks.id, id));
    if (!old) throw new NotFoundError();
    const res = await tx
      .update(tasks)
      .set({
        status,
        completedAt: status === "done" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id));
    if ((res.count ?? 0) === 0) throw new ForbiddenError();
    await writeAudit(tx, user.id, {
      action: "task.status",
      entityType: "task",
      entityId: id,
      oldValue: { status: old.status },
      newValue: { status },
    });
  });
}
