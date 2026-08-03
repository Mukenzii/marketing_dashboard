"use server";

import { revalidatePath } from "next/cache";
import {
  createBlogger,
  updateBlogger,
  deleteBlogger,
  type BloggerInputT,
  type BloggerPatchT,
} from "@/lib/dal/bloggers";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard";

export async function createBloggerAction(
  input: BloggerInputT,
): Promise<ActionResult> {
  try {
    await createBlogger(input);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function updateBloggerAction(
  id: string,
  input: BloggerPatchT,
): Promise<ActionResult> {
  try {
    await updateBlogger(id, input);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteBloggerAction(id: string): Promise<ActionResult> {
  try {
    await deleteBlogger(id);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
