"use server";

import { revalidatePath } from "next/cache";
import { createSpend, updateSpend, deleteSpend } from "@/lib/dal/spend";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard-shell-01";

export async function createSpendAction(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    await createSpend({
      bookId: String(fd.get("bookId") ?? ""),
      type: String(fd.get("type") ?? "blogger") as "blogger" | "production",
      amount: String(fd.get("amount") ?? ""),
      currency: (String(fd.get("currency") ?? "UZS") ||
        "UZS") as "UZS" | "USD" | "EUR" | "RUB",
      fxRate: String(fd.get("fxRate") ?? "1") || "1",
      vendor: String(fd.get("vendor") ?? ""),
      promoCode: String(fd.get("promoCode") ?? ""),
      spentAt: String(fd.get("spentAt") ?? ""),
      notes: String(fd.get("notes") ?? ""),
    });
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function deleteSpendAction(id: string): Promise<ActionResult> {
  try {
    await deleteSpend(id);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function updateSpendAction(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    await updateSpend({
      id: String(fd.get("id") ?? ""),
      amount: String(fd.get("amount") ?? ""),
      vendor: String(fd.get("vendor") ?? ""),
      spentAt: String(fd.get("spentAt") ?? ""),
      notes: String(fd.get("notes") ?? ""),
    });
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
