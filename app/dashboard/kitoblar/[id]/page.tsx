import { notFound } from "next/navigation";

import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import BookDetail from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/book-detail";
import BookMetricsCard from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/book-metrics-card";
import BookDailyMetrics from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/book-daily-metrics";
import BloggerPanel from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/blogger-panel";
import { listBooks } from "@/lib/dal/books";
import { listSpendForBook } from "@/lib/dal/spend";
import { listBloggers } from "@/lib/dal/bloggers";
import { getBookDailyMetrics } from "@/lib/dal/book-metrics";
import { requireRoles } from "@/lib/dal/context";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRoles(["pr_manager"]);
  const { id } = await params;
  const books = await listBooks();
  const book = books.find((b) => b.id === id);
  if (!book) notFound();
  const [spend, bloggers, dailyMetrics] = await Promise.all([
    listSpendForBook(id),
    listBloggers(id),
    getBookDailyMetrics(id),
  ]);

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <BookDetail book={book} spend={spend} />
        <BookDailyMetrics data={dailyMetrics} />
        <BookMetricsCard book={book} />
        <BloggerPanel bookId={id} bloggers={bloggers} />
      </div>
    </AppSidebar>
  );
}
