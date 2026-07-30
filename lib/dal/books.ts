import "server-only";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { withUser } from "./with-user";
import { requireCeoOrThrow } from "./context";
import { NotFoundError } from "./errors";
import { books } from "@/lib/db/schema";
import { writeAudit } from "./audit";

export type BookRow = {
  id: string;
  title: string;
  brand: "falaq_nashr" | "falaq_kids";
  status: string;
  ownerId: string | null;
  ownerName: string | null;
  launchDate: string | null;
  budgetUZS: number;
  adSpendUZS: number;
  bloggerUZS: number;
  productionUZS: number;
  totalCostUZS: number;
  remainingUZS: number;
  burnPct: number | null;
};

/**
 * Books visible to the current user (RLS scopes them), each with TRUE cost =
 * linked ad spend (ad-level insights, converted to UZS) + blogger + production
 * spend. This is the number the rented tool can't produce. Ad spend is summed
 * from entity_type='ad' rows only (the source of truth) to avoid double-count.
 */
export async function listBooks(): Promise<BookRow[]> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT
        b.id, b.title, b.brand, b.status, b.owner_id, b.launch_date,
        u.name AS owner_name,
        b.budget_allocated::float8 AS budget_uzs,
        COALESCE(ad.spend_uzs, 0)::float8 AS ad_spend_uzs,
        COALESCE(bl.amt, 0)::float8 AS blogger_uzs,
        COALESCE(pr.amt, 0)::float8 AS production_uzs
      FROM books b
      LEFT JOIN users u ON u.id = b.owner_id
      LEFT JOIN (
        SELECT c.book_id, SUM(i.spend * i.fx_rate) AS spend_uzs
        FROM campaigns c
        JOIN insights_daily i
          ON i.campaign_id = c.id AND i.entity_type = 'ad'
        GROUP BY c.book_id
      ) ad ON ad.book_id = b.id
      LEFT JOIN (
        SELECT book_id, SUM(amount * fx_rate) AS amt
        FROM spend_entries WHERE type = 'blogger' GROUP BY book_id
      ) bl ON bl.book_id = b.id
      LEFT JOIN (
        SELECT book_id, SUM(amount * fx_rate) AS amt
        FROM spend_entries WHERE type = 'production' GROUP BY book_id
      ) pr ON pr.book_id = b.id
      ORDER BY b.title
    `)) as unknown as Array<Record<string, unknown>>;

    return rows.map((r) => {
      const budgetUZS = Number(r.budget_uzs) || 0;
      const adSpendUZS = Number(r.ad_spend_uzs) || 0;
      const bloggerUZS = Number(r.blogger_uzs) || 0;
      const productionUZS = Number(r.production_uzs) || 0;
      const totalCostUZS = adSpendUZS + bloggerUZS + productionUZS;
      return {
        id: String(r.id),
        title: String(r.title),
        brand: r.brand as BookRow["brand"],
        status: String(r.status),
        ownerId: (r.owner_id as string) ?? null,
        ownerName: (r.owner_name as string) ?? null,
        launchDate: (r.launch_date as string) ?? null,
        budgetUZS,
        adSpendUZS,
        bloggerUZS,
        productionUZS,
        totalCostUZS,
        remainingUZS: budgetUZS - totalCostUZS,
        burnPct: budgetUZS ? (totalCostUZS / budgetUZS) * 100 : null,
      };
    });
  });
}

/* ---------------------------- mutations (CEO) ----------------------------- */

export async function setBudget(
  bookId: string,
  amountUZS: number,
): Promise<void> {
  z.string().uuid().parse(bookId);
  const amount = z.coerce.number().min(0).parse(amountUZS);
  const ceo = await requireCeoOrThrow();
  return withUser(async (tx) => {
    const [old] = await tx
      .select({ b: books.budgetAllocated })
      .from(books)
      .where(eq(books.id, bookId));
    if (!old) throw new NotFoundError();
    await tx
      .update(books)
      .set({ budgetAllocated: String(amount), updatedAt: new Date() })
      .where(eq(books.id, bookId));
    await writeAudit(tx, ceo.id, {
      action: "book.setBudget",
      entityType: "book",
      entityId: bookId,
      oldValue: { budget: old.b },
      newValue: { budget: String(amount) },
    });
  });
}

export async function assignBook(
  bookId: string,
  ownerId: string | null,
): Promise<void> {
  z.string().uuid().parse(bookId);
  const ceo = await requireCeoOrThrow();
  return withUser(async (tx) => {
    const [old] = await tx
      .select({ o: books.ownerId })
      .from(books)
      .where(eq(books.id, bookId));
    if (!old) throw new NotFoundError();
    await tx
      .update(books)
      .set({ ownerId: ownerId || null, updatedAt: new Date() })
      .where(eq(books.id, bookId));
    await writeAudit(tx, ceo.id, {
      action: "book.assign",
      entityType: "book",
      entityId: bookId,
      oldValue: { ownerId: old.o },
      newValue: { ownerId },
    });
  });
}

const NewBook = z.object({
  title: z.string().trim().min(1).max(200),
  brand: z.enum(["falaq_nashr", "falaq_kids"]),
  ownerId: z.string().optional().or(z.literal("")),
  budgetUZS: z.coerce.number().min(0).default(0),
  launchDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
});
export type NewBookInput = z.input<typeof NewBook>;

export async function createBook(
  input: NewBookInput,
): Promise<{ id: string }> {
  const data = NewBook.parse(input);
  const ceo = await requireCeoOrThrow();
  return withUser(async (tx) => {
    const [row] = await tx
      .insert(books)
      .values({
        title: data.title,
        brand: data.brand,
        ownerId: data.ownerId || null,
        budgetAllocated: String(data.budgetUZS),
        launchDate: data.launchDate || null,
        status: "active",
      })
      .returning({ id: books.id });
    await writeAudit(tx, ceo.id, {
      action: "book.create",
      entityType: "book",
      entityId: row.id,
      newValue: data,
    });
    return { id: row.id };
  });
}
