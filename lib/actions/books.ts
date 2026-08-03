"use server";

import { revalidatePath } from "next/cache";
import {
  setBudget,
  assignBook,
  createBook,
  updateBookMetrics,
  type BookMetricsInput,
} from "@/lib/dal/books";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard";

export async function updateBookMetricsAction(
  bookId: string,
  input: BookMetricsInput,
): Promise<ActionResult> {
  try {
    await updateBookMetrics(bookId, input);
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

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
    const num = (k: string) => {
      const v = String(fd.get(k) ?? "").trim();
      return v === "" ? undefined : v;
    };
    const cat = String(fd.get("category") ?? "").trim();
    await createBook({
      title: String(fd.get("title") ?? ""),
      brand: String(fd.get("brand") ?? "falaq_nashr") as
        | "falaq_nashr"
        | "falaq_kids",
      ownerId: String(fd.get("ownerId") ?? ""),
      budgetUZS: String(fd.get("budget") ?? "0"),
      launchDate: String(fd.get("launchDate") ?? ""),
      category: (cat || undefined) as
        | "A+"
        | "A"
        | "B"
        | "C"
        | "new"
        | undefined,
      printRun: num("printRun"),
      salesPrevMonth: num("salesPrevMonth"),
      salesCount: num("salesCount"),
      marketingBudget: num("marketingBudget"),
      targetSales: num("targetSales"),
      targetBudget: num("targetBudget"),
      targetOtherBook: num("targetOtherBook"),
    });
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
