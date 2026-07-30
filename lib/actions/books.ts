"use server";

import { revalidatePath } from "next/cache";
import { setBudget, assignBook, createBook } from "@/lib/dal/books";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard-shell-01";

export async function setBudgetAction(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    await setBudget(
      String(fd.get("bookId") ?? ""),
      Number(fd.get("budget") ?? 0),
    );
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function assignBookAction(
  bookId: string,
  ownerId: string | null,
): Promise<ActionResult> {
  try {
    await assignBook(bookId, ownerId);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function createBookAction(
  _prev: ActionResult,
  fd: FormData,
): Promise<ActionResult> {
  try {
    await createBook({
      title: String(fd.get("title") ?? ""),
      brand: String(fd.get("brand") ?? "falaq_nashr") as
        | "falaq_nashr"
        | "falaq_kids",
      ownerId: String(fd.get("ownerId") ?? ""),
      budgetUZS: String(fd.get("budget") ?? "0"),
      launchDate: String(fd.get("launchDate") ?? ""),
    });
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
