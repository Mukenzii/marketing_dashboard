"use server";

import { revalidatePath } from "next/cache";
import {
  changeRole,
  setUserStatus,
  reassignBooks,
  inviteUser,
} from "@/lib/dal/admin";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard";

export async function changeRoleAction(
  userId: string,
  role: string,
): Promise<ActionResult> {
  try {
    await changeRole(userId, role);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function setUserStatusAction(
  userId: string,
  status: "active" | "inactive",
): Promise<ActionResult> {
  try {
    await setUserStatus(userId, status);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function reassignBooksAction(
  fromUserId: string,
  toUserId: string | null,
): Promise<ActionResult> {
  try {
    await reassignBooks(fromUserId, toUserId);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function inviteUserAction(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    await inviteUser({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      role: String(fd.get("role") ?? "pr_manager"),
    });
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
