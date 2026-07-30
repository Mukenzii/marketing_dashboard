"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createBookAction, setBudgetAction } from "@/lib/actions/books";
import type { ActionResult } from "@/lib/actions/util";
import type { BookRow } from "@/lib/dal/books";
import { fmtUZS, uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";

export type ManagerOption = { id: string; name: string };

const INITIAL: ActionResult = { ok: false };
const selectClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm";

function burnBadgeClass(pct: number | null): string {
  if (pct == null) return "bg-muted text-muted-foreground";
  if (pct >= 100) return "bg-rose-500/10 text-rose-500";
  if (pct >= 80) return "bg-orange-400/10 text-orange-600";
  return "bg-teal-400/10 text-teal-600";
}

function burnBarClass(pct: number | null): string {
  if (pct == null) return "**:data-[slot=progress-indicator]:bg-muted-foreground";
  if (pct >= 100) return "**:data-[slot=progress-indicator]:bg-rose-500";
  if (pct >= 80) return "**:data-[slot=progress-indicator]:bg-orange-400";
  return "**:data-[slot=progress-indicator]:bg-teal-400";
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="py-5">
      <CardContent className="px-5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-foreground">{children}</label>
  );
}

/* -------------------------- edit budget (per row) ------------------------- */

function EditBudgetSheet({ book }: { book: BookRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(setBudgetAction, INITIAL);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        {uz.budgets.editShort}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{uz.budgets.editBudget}</SheetTitle>
          <SheetDescription>{book.title}</SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 px-4">
          <input type="hidden" name="bookId" value={book.id} />
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.budgets.fBudget}</FieldLabel>
            <Input
              name="budget"
              type="number"
              min={0}
              step={1}
              defaultValue={String(book.budgetUZS)}
              className="h-9"
            />
          </div>
          {state.error && (
            <p className="text-sm text-rose-500">{state.error}</p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? uz.budgets.saving : uz.budgets.save}
            </Button>
            <SheetClose render={<Button type="button" variant="outline" />}>
              {uz.budgets.cancel}
            </SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ----------------------------- create book -------------------------------- */

function CreateBookSheet({ users }: { users: ManagerOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createBookAction, INITIAL);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>{uz.budgets.newBook}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{uz.budgets.createTitle}</SheetTitle>
          <SheetDescription>{uz.budgets.createDesc}</SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.budgets.fTitle}</FieldLabel>
            <Input name="title" className="h-9" />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.budgets.fBrand}</FieldLabel>
            <select name="brand" defaultValue="falaq_nashr" className={selectClass}>
              <option value="falaq_nashr">{uz.brands.falaq_nashr}</option>
              <option value="falaq_kids">{uz.brands.falaq_kids}</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.budgets.fOwner}</FieldLabel>
            <select name="ownerId" defaultValue="" className={selectClass}>
              <option value="">{uz.budgets.ownerUnassigned}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.budgets.fBudget}</FieldLabel>
            <Input
              name="budget"
              type="number"
              min={0}
              step={1}
              defaultValue="0"
              className="h-9"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.budgets.fLaunch}</FieldLabel>
            <Input name="launchDate" type="date" className="h-9" />
          </div>
          {state.error && (
            <p className="text-sm text-rose-500">{state.error}</p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? uz.budgets.creating : uz.budgets.create}
            </Button>
            <SheetClose render={<Button type="button" variant="outline" />}>
              {uz.budgets.cancel}
            </SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* --------------------------------- view ----------------------------------- */

export default function BudgetsView({
  books,
  users,
}: {
  books: BookRow[];
  users: ManagerOption[];
}) {
  const totalBudget = books.reduce((s, b) => s + b.budgetUZS, 0);
  const totalSpent = books.reduce((s, b) => s + b.totalCostUZS, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {uz.nav.budgets}
          </h1>
          <p className="text-sm text-muted-foreground">{uz.budgets.subtitle}</p>
        </div>
        <CreateBookSheet users={users} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Kpi label={uz.budgets.kpiBudget} value={fmtUZS(totalBudget)} />
        <Kpi label={uz.budgets.kpiSpent} value={fmtUZS(totalSpent)} />
        <Kpi label={uz.budgets.kpiRemaining} value={fmtUZS(totalRemaining)} />
      </div>

      <Card className="w-full pt-6 pb-0 gap-6">
        <CardHeader className="px-6">
          <CardTitle>{uz.nav.budgets}</CardTitle>
          <CardDescription>{uz.budgets.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {books.length === 0 ? (
            <div className="px-6 pb-6 text-center">
              <p className="text-sm font-medium text-foreground">
                {uz.budgets.empty}
              </p>
              <p className="text-sm text-muted-foreground">
                {uz.budgets.emptyBody}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-4xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.budgets.colBook}
                    </TableHead>
                    <TableHead className="p-2">{uz.budgets.colOwner}</TableHead>
                    <TableHead className="p-2">{uz.budgets.colBudget}</TableHead>
                    <TableHead className="p-2">{uz.budgets.colSpent}</TableHead>
                    <TableHead className="p-2">
                      {uz.budgets.colRemaining}
                    </TableHead>
                    <TableHead className="p-2">{uz.budgets.colBurn}</TableHead>
                    <TableHead className="p-3 pe-6 text-end">
                      {uz.budgets.editBudget}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {books.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="whitespace-nowrap p-3 ps-6">
                        <div className="flex flex-col gap-1">
                          <h6 className="text-sm font-medium text-foreground">
                            {b.title}
                          </h6>
                          <Badge className="w-fit bg-muted text-muted-foreground">
                            {uz.brands[b.brand]}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm text-foreground">
                        {b.ownerName ?? uz.budgets.noOwner}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm text-foreground">
                        {fmtUZS(b.budgetUZS)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2">
                        <p className="text-sm text-foreground">
                          {fmtUZS(b.totalCostUZS)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {uz.metrics.ads}: {fmtUZS(b.adSpendUZS)} ·{" "}
                          {uz.metrics.blogger}: {fmtUZS(b.bloggerUZS)} ·{" "}
                          {uz.metrics.production}: {fmtUZS(b.productionUZS)}
                        </p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm text-foreground">
                        {fmtUZS(b.remainingUZS)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2">
                        <div className="flex w-40 flex-col gap-1.5">
                          <Progress
                            value={
                              b.burnPct == null
                                ? 0
                                : Math.min(100, Math.round(b.burnPct))
                            }
                            className={cn(
                              "h-1.5 [&>div]:h-1.5",
                              burnBarClass(b.burnPct),
                            )}
                          />
                          <Badge
                            className={cn("w-fit", burnBadgeClass(b.burnPct))}
                          >
                            {b.burnPct == null
                              ? uz.common.dash
                              : `${Math.round(b.burnPct)}%`}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-3 pe-6">
                        <div className="flex justify-end">
                          <EditBudgetSheet book={b} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
