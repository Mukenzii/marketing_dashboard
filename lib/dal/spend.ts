import "server-only";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { withUser } from "./with-user";
import { requireUser } from "./context";
import { NotFoundError, ForbiddenError } from "./errors";
import { spendEntries, books } from "@/lib/db/schema";
import { writeAudit } from "./audit";

export type SpendRow = {
  id: string;
  bookId: string;
  type: "blogger" | "production";
  amount: number;
  currency: string;
  fxRate: number;
  amountUZS: number;
  vendor: string | null;
  promoCode: string | null;
  spentAt: string;
  notes: string | null;
  createdBy: string;
  createdAt: string;
  canDelete: boolean; // manager: own + within 24h; ceo: always
};

const SpendInput = z.object({
  bookId: z.string().uuid(),
  type: z.enum(["blogger", "production"]),
  amount: z.coerce.number().positive("Summa musbat bo'lishi kerak"),
  currency: z.enum(["UZS", "USD", "EUR", "RUB"]).default("UZS"),
  fxRate: z.coerce.number().positive().default(1),
  vendor: z.string().trim().min(1, "Vendor kiritilishi shart").max(200),
  promoCode: z.string().trim().max(100).optional(),
  spentAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana noto'g'ri"),
  notes: z.string().trim().max(1000).optional(),
});
export type SpendInput = z.input<typeof SpendInput>;

/** Spend entries for a book (RLS-scoped). */
export async function listSpendForBook(bookId: string): Promise<SpendRow[]> {
  const user = await requireUser();
  return withUser(async (tx) => {
    const rows = await tx
      .select()
      .from(spendEntries)
      .where(eq(spendEntries.bookId, bookId));
    const now = Date.now();
    return rows.map((r) => {
      const amount = Number(r.amount);
      const fxRate = Number(r.fxRate);
      const ageH = (now - new Date(r.createdAt).getTime()) / 3_600_000;
      return {
        id: r.id,
        bookId: r.bookId,
        type: r.type as "blogger" | "production",
        amount,
        currency: r.currency,
        fxRate,
        amountUZS: Math.round(amount * fxRate),
        vendor: r.vendor,
        promoCode: r.promoCode,
        spentAt: r.spentAt as string,
        notes: r.notes,
        createdBy: r.createdBy,
        createdAt: String(r.createdAt),
        canDelete:
          user.isPrivileged || (r.createdBy === user.id && ageH <= 24),
      };
    });
  });
}

export async function createSpend(input: SpendInput): Promise<{ id: string }> {
  const data = SpendInput.parse(input);
  const user = await requireUser();
  return withUser(async (tx) => {
    // book must be visible to the caller (RLS returns nothing otherwise)
    const [book] = await tx
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, data.bookId));
    if (!book) throw new NotFoundError("Kitob topilmadi");

    const [row] = await tx
      .insert(spendEntries)
      .values({
        bookId: data.bookId,
        type: data.type,
        amount: String(data.amount),
        currency: data.currency,
        fxRate: String(data.fxRate),
        vendor: data.vendor,
        promoCode: data.promoCode || null,
        spentAt: data.spentAt,
        createdBy: user.id,
        notes: data.notes || null,
      })
      .returning({ id: spendEntries.id });

    await writeAudit(tx, user.id, {
      action: "spend.create",
      entityType: "spend_entry",
      entityId: row.id,
      newValue: data,
    });
    return { id: row.id };
  });
}

const UpdateSpend = SpendInput.partial().extend({ id: z.string().uuid() });

export async function updateSpend(
  input: z.input<typeof UpdateSpend>,
): Promise<void> {
  const data = UpdateSpend.parse(input);
  const user = await requireUser();
  return withUser(async (tx) => {
    const [old] = await tx
      .select()
      .from(spendEntries)
      .where(eq(spendEntries.id, data.id));
    if (!old) throw new NotFoundError();

    const patch: Record<string, unknown> = {};
    if (data.type) patch.type = data.type;
    if (data.amount != null) patch.amount = String(data.amount);
    if (data.currency) patch.currency = data.currency;
    if (data.fxRate != null) patch.fxRate = String(data.fxRate);
    if (data.vendor != null) patch.vendor = data.vendor;
    if (data.promoCode !== undefined) patch.promoCode = data.promoCode || null;
    if (data.spentAt) patch.spentAt = data.spentAt;
    if (data.notes !== undefined) patch.notes = data.notes || null;

    const res = await tx
      .update(spendEntries)
      .set(patch)
      .where(eq(spendEntries.id, data.id));
    if ((res.count ?? 0) === 0) throw new ForbiddenError();

    await writeAudit(tx, user.id, {
      action: "spend.update",
      entityType: "spend_entry",
      entityId: data.id,
      oldValue: { amount: old.amount, vendor: old.vendor, type: old.type },
      newValue: patch,
    });
  });
}

export async function deleteSpend(id: string): Promise<void> {
  const user = await requireUser();
  return withUser(async (tx) => {
    const [old] = await tx
      .select()
      .from(spendEntries)
      .where(eq(spendEntries.id, id));
    if (!old) throw new NotFoundError();

    // Business rule (also enforced by RLS): managers may delete only their own
    // entries within 24h of creation.
    if (!user.isPrivileged) {
      const ageH =
        (Date.now() - new Date(old.createdAt).getTime()) / 3_600_000;
      if (old.createdBy !== user.id || ageH > 24) {
        throw new ForbiddenError(
          "Faqat o'zingiz yaratgan va 24 soat ichidagi yozuvlarni o'chira olasiz",
        );
      }
    }

    const res = await tx.delete(spendEntries).where(eq(spendEntries.id, id));
    if ((res.count ?? 0) === 0) throw new ForbiddenError();

    await writeAudit(tx, user.id, {
      action: "spend.delete",
      entityType: "spend_entry",
      entityId: id,
      oldValue: { amount: old.amount, vendor: old.vendor, type: old.type },
    });
  });
}
