"use server";

import { revalidatePath } from "next/cache";
import { createTask, updateTaskStatus } from "@/lib/dal/tasks";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard-shell-01";
const STATUSES = ["todo", "in_progress", "review", "done", "blocked"] as const;

export async function createTaskAction(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    await createTask({
      title: String(fd.get("title") ?? ""),
      description: String(fd.get("description") ?? ""),
      bookId: String(fd.get("bookId") ?? ""),
      assigneeId: String(fd.get("assigneeId") ?? ""),
      priority: String(fd.get("priority") ?? "normal") as
        | "low"
        | "normal"
        | "high",
      status: String(fd.get("status") ?? "todo") as (typeof STATUSES)[number],
      dueDate: String(fd.get("dueDate") ?? ""),
    });
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function updateTaskStatusAction(
  id: string,
  status: (typeof STATUSES)[number],
): Promise<ActionResult> {
  try {
    await updateTaskStatus(id, status);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
