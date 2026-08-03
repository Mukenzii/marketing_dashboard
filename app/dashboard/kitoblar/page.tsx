import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import BooksView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/books-view";
import { listBooks } from "@/lib/dal/books";
import { requireDashboardAccess } from "@/lib/dal/context";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireDashboardAccess();
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const all = await listBooks();
  const needle = query.toLowerCase();
  const books = needle
    ? all.filter(
        (b) =>
          b.title.toLowerCase().includes(needle) ||
          (b.ownerName ?? "").toLowerCase().includes(needle),
      )
    : all;

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <BooksView books={books} query={query || undefined} />
      </div>
    </AppSidebar>
  );
}
