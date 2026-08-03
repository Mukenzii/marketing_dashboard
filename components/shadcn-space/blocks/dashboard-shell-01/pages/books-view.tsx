import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { uz, fmtUZS, fmtDate, fmtNumber } from "@/lib/i18n/uz";
import type { BookRow } from "@/lib/dal/books";
import BookCreateSheet from "./book-create-sheet";

/** Total spent per the tracker sheet: Target byudjeti + Target boshqa kitobga + Blogerlar. */
function trackerUsed(b: BookRow): number {
  return (b.targetBudget ?? 0) + (b.targetOtherBook ?? 0) + b.bloggerUZS;
}
/** Astatka: allocated budget − tracker-used. */
function trackerLeft(b: BookRow): number {
  return b.budgetUZS - trackerUsed(b);
}
/** Foiz: tracker-used as a share of the allocated budget. */
function trackerPct(b: BookRow): number | null {
  return b.budgetUZS > 0 ? (trackerUsed(b) / b.budgetUZS) * 100 : null;
}
/** Farq: current-month sales − previous-month sales (null unless both known). */
function salesDiff(b: BookRow): number | null {
  if (b.salesCount == null || b.salesPrevMonth == null) return null;
  return b.salesCount - b.salesPrevMonth;
}

/** Brand chip: falaq_nashr → info (blue), falaq_kids → violet. */
function brandChip(brand: BookRow["brand"]): { label: string; cls: string } {
  if (brand === "falaq_kids")
    return { label: uz.brands.falaq_kids, cls: "bg-violet-500/10 text-violet-600" };
  return { label: uz.brands.falaq_nashr, cls: "bg-blue-500/10 text-blue-600" };
}

/** Category → colour badge (A+/A green, B amber, C red, new blue). */
function categoryCls(c: BookRow["category"]): string {
  if (c === "A+" || c === "A") return "bg-teal-400/10 text-teal-600";
  if (c === "B") return "bg-orange-400/10 text-orange-600";
  if (c === "C") return "bg-rose-500/10 text-rose-500";
  if (c === "new") return "bg-blue-500/10 text-blue-600";
  return "bg-muted text-muted-foreground";
}

/** Burn% → badge + progress-bar colour (<80 teal, 80–100 amber, >100 red).
 *  Full literal class strings so the Tailwind JIT emits them. */
function burnStyle(burn: number | null): { badge: string; bar: string } {
  if (burn == null)
    return {
      badge: "bg-muted text-muted-foreground",
      bar: "**:data-[slot=progress-indicator]:bg-muted-foreground",
    };
  if (burn > 100)
    return {
      badge: "bg-rose-500/10 text-rose-500",
      bar: "**:data-[slot=progress-indicator]:bg-rose-500",
    };
  if (burn >= 80)
    return {
      badge: "bg-orange-400/10 text-orange-600",
      bar: "**:data-[slot=progress-indicator]:bg-orange-400",
    };
  return {
    badge: "bg-teal-400/10 text-teal-600",
    bar: "**:data-[slot=progress-indicator]:bg-teal-400",
  };
}

const burnLabel = (burn: number | null): string =>
  burn == null ? "—" : `${burn.toFixed(0)}%`;

const clampBurn = (burn: number | null): number =>
  burn == null ? 0 : Math.min(100, Math.max(0, burn));

function BookCard({ b }: { b: BookRow }) {
  const chip = brandChip(b.brand);
  const burn = burnStyle(b.burnPct);

  return (
    <Link
      href={`/dashboard/kitoblar/${b.id}`}
      className="block rounded-2xl transition-colors hover:bg-muted/30"
    >
    <Card className="ring-0 border rounded-2xl py-6">
      <CardContent className="px-6 flex flex-col gap-4">
        {/* Title + brand */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-medium text-card-foreground">
              {b.title}
            </h3>
            {b.ownerName != null && (
              <span className="text-xs text-muted-foreground">
                {uz.budgets.colOwner}: {b.ownerName}
              </span>
            )}
          </div>
          <Badge className={cn("font-normal shrink-0", chip.cls)}>
            {chip.label}
          </Badge>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {uz.metrics.budget}
            </span>
            <span className="text-sm font-medium text-card-foreground">
              {fmtUZS(b.budgetUZS)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {uz.metrics.spend}
            </span>
            <span className="text-sm font-medium text-card-foreground">
              {fmtUZS(b.totalCostUZS)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">
              {uz.metrics.remaining}
            </span>
            <span className="text-sm font-medium text-card-foreground">
              {fmtUZS(b.remainingUZS)}
            </span>
          </div>
        </div>

        {/* Burn */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {uz.books.colProgress}
            </span>
            <Badge className={cn("font-normal", burn.badge)}>
              {burnLabel(b.burnPct)}
            </Badge>
          </div>
          <Progress
            value={clampBurn(b.burnPct)}
            className={cn(
              "w-full **:data-[slot=progress-track]:h-2",
              burn.bar,
            )}
          />
        </div>

        {/* Cost breakdown */}
        <p className="text-xs text-muted-foreground">
          {uz.metrics.ads} {fmtUZS(b.adSpendUZS)} · {uz.metrics.blogger}{" "}
          {fmtUZS(b.bloggerUZS)} · {uz.metrics.production}{" "}
          {fmtUZS(b.productionUZS)}
        </p>

        {/* Launch */}
        <span className="text-xs text-muted-foreground">
          {uz.books.launch}: {fmtDate(b.launchDate)}
        </span>
      </CardContent>
    </Card>
    </Link>
  );
}

export default function BooksView({
  books,
  query,
}: {
  books: BookRow[];
  query?: string;
}) {
  return (
    <>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium text-card-foreground">
            {uz.nav.books}
          </h1>
          <p className="text-sm text-muted-foreground">
            {query
              ? `${uz.books.searchFor} "${query}" — ${books.length}`
              : uz.books.subtitle}
          </p>
        </div>
        <BookCreateSheet />
      </div>

      {books.length === 0 ? (
        <Card className="ring-0 border rounded-2xl py-12">
          <CardContent className="px-6 flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium text-card-foreground">
              {uz.books.empty}
            </p>
            <p className="text-xs text-muted-foreground">{uz.books.emptyBody}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {books.map((b) => (
              <BookCard key={b.id} b={b} />
            ))}
          </div>

          {/* Books table */}
          <Card className="w-full pb-0 pt-6 gap-6 ring-0 border rounded-2xl">
            <CardHeader className="px-6">
              <CardTitle className="leading-normal">
                {uz.books.tableTitle}
              </CardTitle>
              <CardDescription>{uz.books.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table className="min-w-[1100px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent!">
                      <TableHead className="p-3 ps-6">#</TableHead>
                      <TableHead className="p-2">{uz.budgets.colBook}</TableHead>
                      <TableHead className="p-2">{uz.tracker.category}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.printRun}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.salesPrev}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.salesNow}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.diff}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.marketingBudget}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.targetBudget}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.targetOther}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.bloggers}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.totalUsed}</TableHead>
                      <TableHead className="p-2 text-right">{uz.tracker.stock}</TableHead>
                      <TableHead className="p-3 pe-6 text-right">{uz.tracker.percent}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {books.map((b, index) => {
                      const chip = brandChip(b.brand);
                      const used = trackerUsed(b);
                      const left = trackerLeft(b);
                      const pct = trackerPct(b);
                      const diff = salesDiff(b);
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="whitespace-nowrap p-3 ps-6 text-sm text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/kitoblar/${b.id}`}
                                className="text-sm font-medium text-card-foreground hover:underline"
                              >
                                {b.title}
                              </Link>
                              <Badge
                                className={cn("font-normal shrink-0", chip.cls)}
                              >
                                {chip.label}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2">
                            {b.category ? (
                              <Badge className={cn("font-medium", categoryCls(b.category))}>
                                {b.category}
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                {uz.common.dash}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                            {b.printRun == null ? uz.common.dash : fmtNumber(b.printRun)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                            {b.salesPrevMonth == null ? uz.common.dash : fmtNumber(b.salesPrevMonth)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                            {b.salesCount == null ? uz.common.dash : fmtNumber(b.salesCount)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                            {diff == null ? (
                              <span className="text-muted-foreground">{uz.common.dash}</span>
                            ) : (
                              <span
                                className={cn(
                                  diff > 0 && "text-teal-600",
                                  diff < 0 && "text-rose-500",
                                )}
                              >
                                {diff > 0 ? "+" : ""}
                                {fmtNumber(diff)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                            {fmtUZS(b.budgetUZS)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                            {b.targetBudget == null ? uz.common.dash : fmtUZS(b.targetBudget)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                            {b.targetOtherBook == null ? uz.common.dash : fmtUZS(b.targetOtherBook)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-right text-sm tabular-nums">
                            {fmtUZS(b.bloggerUZS)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-right text-sm font-medium tabular-nums">
                            {fmtUZS(used)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "whitespace-nowrap p-2 text-right text-sm tabular-nums",
                              left < 0 && "text-rose-500",
                            )}
                          >
                            {fmtUZS(left)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-3 pe-6 text-right text-sm tabular-nums">
                            {pct == null ? uz.common.dash : `${pct.toFixed(0)}%`}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </>
  );
}
