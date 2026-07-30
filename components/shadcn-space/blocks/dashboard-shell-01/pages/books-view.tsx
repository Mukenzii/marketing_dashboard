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
import { uz, fmtUZS, fmtDate } from "@/lib/i18n/uz";
import type { BookRow } from "@/lib/dal/books";

/** Brand chip: falaq_nashr → info (blue), falaq_kids → violet. */
function brandChip(brand: BookRow["brand"]): { label: string; cls: string } {
  if (brand === "falaq_kids")
    return { label: uz.brands.falaq_kids, cls: "bg-violet-500/10 text-violet-600" };
  return { label: uz.brands.falaq_nashr, cls: "bg-blue-500/10 text-blue-600" };
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
      href={`/dashboard-shell-01/kitoblar/${b.id}`}
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
                <Table className="min-w-2xl">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent!">
                      <TableHead className="p-3 ps-6">#</TableHead>
                      <TableHead className="p-2">{uz.budgets.colBook}</TableHead>
                      <TableHead className="p-2">
                        {uz.budgets.colBudget}
                      </TableHead>
                      <TableHead className="p-2">{uz.budgets.colOwner}</TableHead>
                      <TableHead className="p-2">{uz.budgets.colSpent}</TableHead>
                      <TableHead className="p-2 min-w-40">
                        {uz.books.colProgress}
                      </TableHead>
                      <TableHead className="p-3 pe-6 text-right">
                        {uz.budgets.colRemaining}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {books.map((b, index) => {
                      const chip = brandChip(b.brand);
                      const burn = burnStyle(b.burnPct);
                      return (
                        <TableRow key={b.id}>
                          <TableCell className="whitespace-nowrap p-3 ps-6 text-sm text-muted-foreground">
                            {index + 1}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard-shell-01/kitoblar/${b.id}`}
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
                          <TableCell className="whitespace-nowrap p-2 text-sm">
                            {fmtUZS(b.budgetUZS)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-sm">
                            {b.ownerName ?? uz.budgets.noOwner}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2 text-sm">
                            {fmtUZS(b.totalCostUZS)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-2">
                            <div className="flex items-center gap-2">
                              <Progress
                                value={clampBurn(b.burnPct)}
                                className={cn(
                                  "w-full **:data-[slot=progress-track]:h-1.5",
                                  burn.bar,
                                )}
                              />
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {burnLabel(b.burnPct)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap p-3 pe-6 text-right text-sm">
                            {fmtUZS(b.remainingUZS)}
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
