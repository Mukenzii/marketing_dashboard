"use server";

import { revalidatePath } from "next/cache";

import { uploadAvatar, removeAvatar } from "@/lib/dal/profile";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard";

export async function uploadAvatarAction(fd: FormData): Promise<ActionResult> {
  try {
    const file = fd.get("avatar");
    if (!(file instanceof File) || file.size === 0)
      return { ok: false, error: "Fayl topilmadi." };
    // async — never block on the buffer read
    const bytes = Buffer.from(await file.arrayBuffer());
    await uploadAvatar(bytes, file.type);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function removeAvatarAction(): Promise<ActionResult> {
  try {
    await removeAvatar();
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
