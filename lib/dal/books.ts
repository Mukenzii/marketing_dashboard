import "server-only";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { withUser } from "./with-user";
import { requireUser, requireCeoOrThrow } from "./context";
import { ForbiddenError, NotFoundError } from "./errors";
import { books } from "@/lib/db/schema";
import { writeAudit } from "./audit";

/** Category from period sales, per the PR team's thresholds (see §sheet). */
export function deriveCategory(sales: number | null): BookCategory | null {
  if (sales == null || sales <= 0) return null;
  if (sales < 2000) return "C";
  if (sales < 11000) return "B";
  if (sales <= 73000) return "A";
  return "A+";
}

export type BookCategory = "A+" | "A" | "B" | "C" | "new";

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
  // --- PR-manager performance tracker ---
  category: BookCategory | null;
  categoryOverride: boolean;
  printRun: number | null;
  salesPrevMonth: number | null; // Sotuv (oldingi oy)
  salesCount: number | null; // Sotuv (joriy oy)
  stockRemaining: number | null;
  marketingBudget: number | null;
  targetSales: number | null;
  targetBudget: number | null;
  targetOtherBook: number | null; // Target boshqa kitobga
  percent: number | null;
  bloggerBudgetUZS: number; // sum of allocated blogger budgets
  bloggerSpentUZS: number; // sum of actual blogger spend
};

/**
 * Books visible to the current user (RLS scopes them), each with TRUE cost =
 * linked ad spend (campaign-level insights, converted to UZS) + blogger +
 * production spend. This is the number the rented tool can't produce. Ad spend
 * is summed from entity_type='campaign' rows (one per campaign per day) — the
 * additive grain that avoids the double-count of summing per-ad reach.
 */
export async function listBooks(): Promise<BookRow[]> {
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT
        b.id, b.title, b.brand, b.status, b.owner_id, b.launch_date,
        u.name AS owner_name,
        b.budget_allocated::float8 AS budget_uzs,
        b.category, b.category_override,
        b.print_run, b.stock_remaining, b.sales_prev_month, b.sales_count,
        b.marketing_budget::float8 AS marketing_budget,
        b.target_sales, b.target_budget::float8 AS target_budget,
        b.target_other_book::float8 AS target_other_book,
        b.percent::float8 AS percent,
        COALESCE(ad.spend_uzs, 0)::float8 AS ad_spend_uzs,
        COALESCE(bl.amt, 0)::float8 AS blogger_uzs,
        COALESCE(pr.amt, 0)::float8 AS production_uzs,
        COALESCE(bg.budget, 0)::float8 AS blogger_budget_uzs,
        COALESCE(bg.spent, 0)::float8 AS blogger_spent_uzs
      FROM books b
      LEFT JOIN users u ON u.id = b.owner_id
      LEFT JOIN (
        SELECT c.book_id, SUM(i.spend * i.fx_rate) AS spend_uzs
        FROM campaigns c
        JOIN insights_daily i
          ON i.campaign_id = c.id AND i.entity_type = 'campaign'
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
      LEFT JOIN (
        SELECT book_id, SUM(budget_allocated) AS budget, SUM(spent) AS spent
        FROM bloggers GROUP BY book_id
      ) bg ON bg.book_id = b.id
      ORDER BY b.title
    `)) as unknown as Array<Record<string, unknown>>;

    const numOrNull = (v: unknown): number | null =>
      v == null ? null : Number(v);

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
        category: (r.category as BookCategory) ?? null,
        categoryOverride: Boolean(r.category_override),
        printRun: numOrNull(r.print_run),
        stockRemaining: numOrNull(r.stock_remaining),
        salesPrevMonth: numOrNull(r.sales_prev_month),
        salesCount: numOrNull(r.sales_count),
        marketingBudget: numOrNull(r.marketing_budget),
        targetSales: numOrNull(r.target_sales),
        targetBudget: numOrNull(r.target_budget),
        targetOtherBook: numOrNull(r.target_other_book),
        percent: numOrNull(r.percent),
        bloggerBudgetUZS: Number(r.blogger_budget_uzs) || 0,
        bloggerSpentUZS: Number(r.blogger_spent_uzs) || 0,
      };
    });
  });
}

/* ----------------- performance tracker (owning manager or CEO) ------------ */

const BookMetrics = z.object({
  // category: a specific value → manual override; null/undefined → auto-derive
  category: z.enum(["A+", "A", "B", "C", "new"]).nullish(),
  printRun: z.coerce.number().int().min(0).nullish(),
  stockRemaining: z.coerce.number().int().min(0).nullish(),
  salesPrevMonth: z.coerce.number().int().min(0).nullish(),
  salesCount: z.coerce.number().int().min(0).nullish(),
  marketingBudget: z.coerce.number().nullish(), // Byudjet — may be negative
  targetSales: z.coerce.number().int().min(0).nullish(),
  targetBudget: z.coerce.number().min(0).nullish(),
  targetOtherBook: z.coerce.number().min(0).nullish(),
  percent: z.coerce.number().nullish(),
});
export type BookMetricsInput = z.input<typeof BookMetrics>;

const nOrNull = (v: number | null | undefined): number | null =>
  v == null ? null : v;
const sOrNull = (v: number | null | undefined): string | null =>
  v == null ? null : String(v);

/**
 * Update a book's PR-performance fields. Any authenticated user may call it, but
 * RLS scopes the write to a book they own (CEO: all). The DAL writes ONLY the
 * tracker columns — never owner/brand/title/budget_allocated — so relaxing the
 * row policy can't let a manager escalate. Category auto-derives from sales
 * unless a specific one is chosen (manual override).
 */
export async function updateBookMetrics(
  bookId: string,
  input: BookMetricsInput,
): Promise<void> {
  z.string().uuid().parse(bookId);
  const data = BookMetrics.parse(input);
  const user = await requireUser();

  const manual = data.category != null;
  const category = manual
    ? data.category!
    : deriveCategory(nOrNull(data.salesCount));

  return withUser(async (tx) => {
    const [cur] = await tx
      .select({ id: books.id })
      .from(books)
      .where(eq(books.id, bookId));
    if (!cur) throw new NotFoundError(); // missing or not visible to this user

    const res = await tx
      .update(books)
      .set({
        category,
        categoryOverride: manual,
        printRun: nOrNull(data.printRun),
        stockRemaining: nOrNull(data.stockRemaining),
        salesPrevMonth: nOrNull(data.salesPrevMonth),
        salesCount: nOrNull(data.salesCount),
        marketingBudget: sOrNull(data.marketingBudget),
        targetSales: nOrNull(data.targetSales),
        targetBudget: sOrNull(data.targetBudget),
        targetOtherBook: sOrNull(data.targetOtherBook),
        percent: sOrNull(data.percent),
        updatedAt: new Date(),
      })
      .where(eq(books.id, bookId));
    // RLS blocked the update (not the owner) → 0 rows
    if ((res.count ?? 0) === 0)
      throw new ForbiddenError("Bu kitobni tahrirlash huquqingiz yo'q");

    await writeAudit(tx, user.id, {
      action: "book.metrics",
      entityType: "book",
      entityId: bookId,
      newValue: { ...data, category, categoryOverride: manual },
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
  brand: z.enum(["falaq_nashr", "falaq_kids"]).default("falaq_nashr"),
  ownerId: z.string().optional().or(z.literal("")),
  budgetUZS: z.coerce.number().min(0).default(0),
  launchDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .or(z.literal("")),
  // tracker fields (same as BookMetrics) — optional on create
  category: z.enum(["A+", "A", "B", "C", "new"]).nullish(),
  printRun: z.coerce.number().int().min(0).nullish(),
  salesPrevMonth: z.coerce.number().int().min(0).nullish(),
  salesCount: z.coerce.number().int().min(0).nullish(),
  marketingBudget: z.coerce.number().nullish(),
  targetSales: z.coerce.number().int().min(0).nullish(),
  targetBudget: z.coerce.number().min(0).nullish(),
  targetOtherBook: z.coerce.number().min(0).nullish(),
});
export type NewBookInput = z.input<typeof NewBook>;

/**
 * Create a book. CEO / Head of Marketing may assign any owner; a PR manager can
 * only create a book they own themselves (RLS + this forced owner enforce it).
 */
export async function createBook(
  input: NewBookInput,
): Promise<{ id: string }> {
  const data = NewBook.parse(input);
  const user = await requireUser();
  // non-privileged → forced to own the book (can't create for someone else)
  const ownerId = user.isPrivileged ? data.ownerId || null : user.id;

  const manual = data.category != null;
  const category = manual
    ? data.category!
    : deriveCategory(nOrNull(data.salesCount));

  return withUser(async (tx) => {
    const [row] = await tx
      .insert(books)
      .values({
        title: data.title,
        brand: data.brand,
        ownerId,
        budgetAllocated: String(data.budgetUZS),
        launchDate: data.launchDate || null,
        status: "active",
        category,
        categoryOverride: manual,
        printRun: nOrNull(data.printRun),
        salesPrevMonth: nOrNull(data.salesPrevMonth),
        salesCount: nOrNull(data.salesCount),
        marketingBudget: sOrNull(data.marketingBudget),
        targetSales: nOrNull(data.targetSales),
        targetBudget: sOrNull(data.targetBudget),
        targetOtherBook: sOrNull(data.targetOtherBook),
      })
      .returning({ id: books.id });
    await writeAudit(tx, user.id, {
      action: "book.create",
      entityType: "book",
      entityId: row.id,
      newValue: { ...data, ownerId },
    });
    return { id: row.id };
  });
}
