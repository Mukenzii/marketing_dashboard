import "server-only";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { withUser } from "./with-user";
import { requireUser } from "./context";
import { ForbiddenError, NotFoundError } from "./errors";
import { bloggers } from "@/lib/db/schema";
import { writeAudit } from "./audit";

export type BloggerRow = {
  id: string;
  bookId: string;
  name: string;
  platform: string | null;
  budgetAllocated: number;
  spent: number;
  remaining: number;
  currency: string;
  note: string | null;
};

/** Bloggers for a book. RLS returns rows only for books the user owns (CEO: all). */
export async function listBloggers(bookId: string): Promise<BloggerRow[]> {
  z.string().uuid().parse(bookId);
  return withUser(async (tx) => {
    const rows = (await tx.execute(sql`
      SELECT id, book_id, name, platform,
             budget_allocated::float8 AS budget, spent::float8 AS spent,
             currency, note
      FROM bloggers WHERE book_id = ${bookId}
      ORDER BY name
    `)) as unknown as Array<Record<string, unknown>>;
    return rows.map((r) => {
      const budget = Number(r.budget) || 0;
      const spent = Number(r.spent) || 0;
      return {
        id: String(r.id),
        bookId: String(r.book_id),
        name: String(r.name),
        platform: (r.platform as string) ?? null,
        budgetAllocated: budget,
        spent,
        remaining: budget - spent,
        currency: String(r.currency),
        note: (r.note as string) ?? null,
      };
    });
  });
}

const BloggerInput = z.object({
  bookId: z.string().uuid(),
  name: z.string().trim().min(1).max(160),
  platform: z.string().trim().max(60).optional().or(z.literal("")),
  budgetAllocated: z.coerce.number().min(0).default(0),
  spent: z.coerce.number().min(0).default(0),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});
export type BloggerInputT = z.input<typeof BloggerInput>;

/** Add a blogger to a book. RLS insert policy enforces the caller owns the book. */
export async function createBlogger(
  input: BloggerInputT,
): Promise<{ id: string }> {
  const data = BloggerInput.parse(input);
  const user = await requireUser();
  return withUser(async (tx) => {
    let id: string;
    try {
      const [row] = await tx
        .insert(bloggers)
        .values({
          bookId: data.bookId,
          name: data.name,
          platform: data.platform || null,
          budgetAllocated: String(data.budgetAllocated),
          spent: String(data.spent),
          note: data.note || null,
          createdBy: user.id,
        })
        .returning({ id: bloggers.id });
      id = row.id;
    } catch (e) {
      // RLS WITH CHECK failed → user doesn't own the book
      if ((e as { code?: string }).code === "42501")
        throw new ForbiddenError("Bu kitobga bloger qo'sha olmaysiz");
      throw e;
    }
    await writeAudit(tx, user.id, {
      action: "blogger.create",
      entityType: "blogger",
      entityId: id,
      newValue: data,
    });
    return { id };
  });
}

const BloggerPatch = z.object({
  name: z.string().trim().min(1).max(160),
  platform: z.string().trim().max(60).optional().or(z.literal("")),
  budgetAllocated: z.coerce.number().min(0),
  spent: z.coerce.number().min(0),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});
export type BloggerPatchT = z.input<typeof BloggerPatch>;

export async function updateBlogger(
  id: string,
  input: BloggerPatchT,
): Promise<void> {
  z.string().uuid().parse(id);
  const data = BloggerPatch.parse(input);
  const user = await requireUser();
  return withUser(async (tx) => {
    const res = await tx
      .update(bloggers)
      .set({
        name: data.name,
        platform: data.platform || null,
        budgetAllocated: String(data.budgetAllocated),
        spent: String(data.spent),
        note: data.note || null,
        updatedAt: new Date(),
      })
      .where(eq(bloggers.id, id));
    if ((res.count ?? 0) === 0) throw new NotFoundError("Bloger topilmadi");
    await writeAudit(tx, user.id, {
      action: "blogger.update",
      entityType: "blogger",
      entityId: id,
      newValue: data,
    });
  });
}

export async function deleteBlogger(id: string): Promise<void> {
  z.string().uuid().parse(id);
  const user = await requireUser();
  return withUser(async (tx) => {
    const res = await tx.delete(bloggers).where(eq(bloggers.id, id));
    if ((res.count ?? 0) === 0) throw new NotFoundError("Bloger topilmadi");
    await writeAudit(tx, user.id, {
      action: "blogger.delete",
      entityType: "blogger",
      entityId: id,
    });
  });
}
