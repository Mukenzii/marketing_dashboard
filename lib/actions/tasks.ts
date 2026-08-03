"use server";

import { revalidatePath } from "next/cache";
import {
  createTask,
  updateTaskStatus,
  listComments,
  addComment,
  type TaskComment,
} from "@/lib/dal/tasks";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard";
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

/** Fetch a task's comments (client-called when the detail sheet opens). */
export async function listCommentsAction(
  taskId: string,
): Promise<{ ok: boolean; comments?: TaskComment[]; error?: string }> {
  try {
    return { ok: true, comments: await listComments(taskId) };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function addCommentAction(
  taskId: string,
  body: string,
): Promise<ActionResult> {
  try {
    await addComment(taskId, body);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
