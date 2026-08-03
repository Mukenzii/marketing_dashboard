"use server";

import { revalidatePath } from "next/cache";
import { markAllRead, markRead } from "@/lib/dal/notifications";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard";

export async function markAllReadAction(): Promise<ActionResult> {
  try {
    await markAllRead();
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function markReadAction(id: string): Promise<ActionResult> {
  try {
    await markRead(id);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
