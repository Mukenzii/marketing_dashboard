import { notFound } from "next/navigation";

import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import BookDetail from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/book-detail";
import { listBooks } from "@/lib/dal/books";
import { listSpendForBook } from "@/lib/dal/spend";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const books = await listBooks();
  const book = books.find((b) => b.id === id);
  if (!book) notFound();
  const spend = await listSpendForBook(id);

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <BookDetail book={book} spend={spend} />
      </div>
    </AppSidebar>
  );
}
