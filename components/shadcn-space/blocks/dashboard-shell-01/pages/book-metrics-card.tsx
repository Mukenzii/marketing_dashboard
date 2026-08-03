"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookRow, BookCategory } from "@/lib/dal/books";
import { updateBookMetricsAction } from "@/lib/actions/books";
import { uz, fmtNumber, fmtUZS } from "@/lib/i18n/uz";

/** Category → colour, matching the PR team's green/yellow/red sheet. */
export function categoryStyle(c: BookCategory | null): string {
  switch (c) {
    case "A+":
    case "A":
      return "bg-teal-400/10 text-teal-600";
    case "B":
      return "bg-orange-400/10 text-orange-600";
    case "C":
      return "bg-rose-500/10 text-rose-500";
    case "new":
      return "bg-blue-500/10 text-blue-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

const selectCls =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

type FormState = {
  category: "" | BookCategory; // "" = auto
  printRun: string;
  stockRemaining: string;
  salesPrevMonth: string;
  salesCount: string;
  marketingBudget: string;
  targetSales: string;
  targetBudget: string;
  targetOtherBook: string;
  percent: string;
};

const toStr = (n: number | null): string => (n == null ? "" : String(n));

export default function BookMetricsCard({ book }: { book: BookRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState<FormState>({
    category: book.categoryOverride && book.category ? book.category : "",
    printRun: toStr(book.printRun),
    stockRemaining: toStr(book.stockRemaining),
    salesPrevMonth: toStr(book.salesPrevMonth),
    salesCount: toStr(book.salesCount),
    marketingBudget: toStr(book.marketingBudget),
    targetSales: toStr(book.targetSales),
    targetBudget: toStr(book.targetBudget),
    targetOtherBook: toStr(book.targetOtherBook),
    percent: toStr(book.percent),
  });

  const set = (k: keyof FormState) => (v: string) =>
    setF((p) => ({ ...p, [k]: v }));
  const numOrNull = (s: string) => (s.trim() === "" ? null : Number(s));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await updateBookMetricsAction(book.id, {
        category: f.category === "" ? null : f.category,
        printRun: numOrNull(f.printRun),
        stockRemaining: numOrNull(f.stockRemaining),
        salesPrevMonth: numOrNull(f.salesPrevMonth),
        salesCount: numOrNull(f.salesCount),
        marketingBudget: numOrNull(f.marketingBudget),
        targetSales: numOrNull(f.targetSales),
        targetBudget: numOrNull(f.targetBudget),
        targetOtherBook: numOrNull(f.targetOtherBook),
        percent: numOrNull(f.percent),
      });
      if (!res.ok) {
        setError(res.error ?? "Xatolik");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  const numField = (label: string, k: keyof FormState) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input
        type="number"
        step="any"
        value={f[k]}
        onChange={(e) => set(k)(e.target.value)}
      />
    </div>
  );

  const stat = (label: string, value: string) => (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-card-foreground">{value}</span>
    </div>
  );

  return (
    <Card className="w-full ring-0 border rounded-2xl">
      <CardHeader className="px-6 pt-6 flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 leading-normal">
          {uz.tracker.title}
          {book.category && (
            <Badge className={cn("font-medium", categoryStyle(book.category))}>
              {book.category}
              {!book.categoryOverride && book.salesCount != null && (
                <span className="ml-1 opacity-70">({uz.tracker.auto})</span>
              )}
            </Badge>
          )}
        </CardTitle>
        {!open && (
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
            <Pencil className="size-3.5" />
            {uz.tracker.edit}
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6">
        {!open ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stat(uz.tracker.printRun, book.printRun == null ? "—" : fmtNumber(book.printRun))}
            {stat(uz.tracker.stock, book.stockRemaining == null ? "—" : fmtNumber(book.stockRemaining))}
            {stat(uz.tracker.salesPrev, book.salesPrevMonth == null ? "—" : fmtNumber(book.salesPrevMonth))}
            {stat(uz.tracker.salesNow, book.salesCount == null ? "—" : fmtNumber(book.salesCount))}
            {stat(uz.tracker.percent, book.percent == null ? "—" : `${book.percent}%`)}
            {stat(uz.tracker.marketingBudget, book.marketingBudget == null ? "—" : fmtUZS(book.marketingBudget))}
            {stat(uz.tracker.target, book.targetSales == null ? "—" : fmtNumber(book.targetSales))}
            {stat(uz.tracker.targetBudget, book.targetBudget == null ? "—" : fmtUZS(book.targetBudget))}
            {stat(uz.tracker.targetOther, book.targetOtherBook == null ? "—" : fmtUZS(book.targetOtherBook))}
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground">
                  {uz.tracker.category}
                </label>
                <select
                  value={f.category}
                  onChange={(e) => set("category")(e.target.value as FormState["category"])}
                  className={selectCls}
                >
                  <option value="">{uz.tracker.categoryAuto}</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="new">{uz.tracker.catNew}</option>
                </select>
              </div>
              {numField(uz.tracker.printRun, "printRun")}
              {numField(uz.tracker.stock, "stockRemaining")}
              {numField(uz.tracker.salesPrev, "salesPrevMonth")}
              {numField(uz.tracker.salesNow, "salesCount")}
              {numField(uz.tracker.marketingBudget, "marketingBudget")}
              {numField(uz.tracker.target, "targetSales")}
              {numField(uz.tracker.targetBudget, "targetBudget")}
              {numField(uz.tracker.targetOther, "targetOtherBook")}
              {numField(uz.tracker.percent, "percent")}
            </div>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={pending}>
                {uz.tracker.save}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                {uz.tracker.cancel}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
