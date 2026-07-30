"use server";

import { revalidatePath } from "next/cache";
import {
  createThreshold,
  updateThreshold,
  deleteThreshold,
  type ThresholdInput,
} from "@/lib/dal/admin";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard-shell-01";

export async function createThresholdAction(
  input: ThresholdInput,
): Promise<ActionResult> {
  try {
    await createThreshold(input);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function updateThresholdAction(
  id: string,
  input: ThresholdInput,
): Promise<ActionResult> {
  try {
    await updateThreshold(id, input);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteThresholdAction(id: string): Promise<ActionResult> {
  try {
    await deleteThreshold(id);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
