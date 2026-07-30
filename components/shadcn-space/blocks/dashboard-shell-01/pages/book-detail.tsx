"use client";

import * as React from "react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { uz, fmtUZS, fmtDate } from "@/lib/i18n/uz";
import type { BookRow } from "@/lib/dal/books";
import type { SpendRow } from "@/lib/dal/spend";
import type { ActionResult } from "@/lib/actions/util";
import {
  createSpendAction,
  updateSpendAction,
  deleteSpendAction,
} from "@/lib/actions/spend";

/* ----------------------------- shared styling ----------------------------- */

const initialState: ActionResult = { ok: false };

const selectCls =
  "w-full rounded-md border bg-background px-3 py-2 text-sm";

function brandChip(brand: BookRow["brand"]): { label: string; cls: string } {
  if (brand === "falaq_kids")
    return {
      label: uz.brands.falaq_kids,
      cls: "bg-violet-500/10 text-violet-600",
    };
  return {
    label: uz.brands.falaq_nashr,
    cls: "bg-blue-500/10 text-blue-600",
  };
}

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

function typeChip(type: SpendRow["type"]): { label: string; cls: string } {
  if (type === "production")
    return {
      label: uz.bookDetail.typeProduction,
      cls: "bg-blue-500/10 text-blue-600",
    };
  return {
    label: uz.bookDetail.typeBlogger,
    cls: "bg-teal-400/10 text-teal-600",
  };
}

const todayISO = (): string => new Date().toISOString().slice(0, 10);

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-foreground">{children}</label>
  );
}

/* ------------------------------ create form ------------------------------ */

function CreateSpendSheet({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("UZS");
  const [state, formAction, pending] = useActionState(
    createSpendAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button className="bg-blue-500 text-white hover:bg-blue-500/90" />
        }
      >
        {uz.bookDetail.addSpend}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{uz.bookDetail.createTitle}</SheetTitle>
          <SheetDescription>{uz.bookDetail.createDesc}</SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 px-4">
          <input type="hidden" name="bookId" value={bookId} />

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fType}</FieldLabel>
            <select name="type" defaultValue="blogger" className={selectCls}>
              <option value="blogger">{uz.bookDetail.typeBlogger}</option>
              <option value="production">
                {uz.bookDetail.typeProduction}
              </option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fAmount}</FieldLabel>
            <Input name="amount" type="number" min="0" step="any" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fCurrency}</FieldLabel>
            <select
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={selectCls}
            >
              <option value="UZS">UZS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="RUB">RUB</option>
            </select>
          </div>

          {currency !== "UZS" && (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>{uz.bookDetail.fFxRate}</FieldLabel>
              <Input
                name="fxRate"
                type="number"
                min="0"
                step="any"
                defaultValue="1"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fVendor}</FieldLabel>
            <Input name="vendor" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fPromoCode}</FieldLabel>
            <Input name="promoCode" />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fSpentAt}</FieldLabel>
            <Input name="spentAt" type="date" defaultValue={todayISO()} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fNotes}</FieldLabel>
            <Textarea name="notes" rows={3} />
          </div>

          {state.error && (
            <p className="text-sm text-rose-500">{state.error}</p>
          )}

          <SheetFooter className="px-0">
            <Button
              type="submit"
              disabled={pending}
              className="bg-blue-500 text-white hover:bg-blue-500/90"
            >
              {uz.bookDetail.save}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------- edit form ------------------------------- */

function EditSpendSheet({ row }: { row: SpendRow }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateSpendAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="sm" />}>
        {uz.bookDetail.edit}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{uz.bookDetail.editTitle}</SheetTitle>
          <SheetDescription>{uz.bookDetail.editDesc}</SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 px-4">
          <input type="hidden" name="id" value={row.id} />

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fAmount}</FieldLabel>
            <Input
              name="amount"
              type="number"
              min="0"
              step="any"
              defaultValue={row.amount}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fVendor}</FieldLabel>
            <Input name="vendor" defaultValue={row.vendor ?? ""} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fSpentAt}</FieldLabel>
            <Input
              name="spentAt"
              type="date"
              defaultValue={row.spentAt}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.bookDetail.fNotes}</FieldLabel>
            <Textarea name="notes" rows={3} defaultValue={row.notes ?? ""} />
          </div>

          {state.error && (
            <p className="text-sm text-rose-500">{state.error}</p>
          )}

          <SheetFooter className="px-0">
            <Button
              type="submit"
              disabled={pending}
              className="bg-blue-500 text-white hover:bg-blue-500/90"
            >
              {uz.bookDetail.save}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/* ------------------------------ delete button ---------------------------- */

function DeleteSpendButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    if (!window.confirm(uz.bookDetail.confirmDelete)) return;
    startTransition(async () => {
      const result = await deleteSpendAction(id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={onDelete}
    >
      {uz.bookDetail.delete}
    </Button>
  );
}

/* --------------------------------- view ---------------------------------- */

export default function BookDetail({
  book,
  spend,
}: {
  book: BookRow;
  spend: SpendRow[];
}) {
  const chip = brandChip(book.brand);
  const burn = burnStyle(book.burnPct);

  return (
    <>
      {/* Header card */}
      <Card className="ring-0 border rounded-2xl py-6">
        <CardContent className="px-6 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-medium text-card-foreground">
                {book.title}
              </h1>
              <span className="text-xs text-muted-foreground">
                {uz.bookDetail.owner}: {book.ownerName ?? uz.bookDetail.noOwner}
              </span>
            </div>
            <Badge className={cn("font-normal shrink-0", chip.cls)}>
              {chip.label}
            </Badge>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                {uz.metrics.budget}
              </span>
              <span className="text-sm font-medium text-card-foreground">
                {fmtUZS(book.budgetUZS)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                {uz.metrics.spend}
              </span>
              <span className="text-sm font-medium text-card-foreground">
                {fmtUZS(book.totalCostUZS)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                {uz.metrics.remaining}
              </span>
              <span className="text-sm font-medium text-card-foreground">
                {fmtUZS(book.remainingUZS)}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {uz.bookDetail.burn}
                </span>
                <Badge className={cn("font-normal", burn.badge)}>
                  {burnLabel(book.burnPct)}
                </Badge>
              </div>
              <Progress
                value={clampBurn(book.burnPct)}
                className={cn(
                  "w-full **:data-[slot=progress-track]:h-2",
                  burn.bar,
                )}
              />
            </div>
          </div>

          {/* Breakdown */}
          <p className="text-xs text-muted-foreground">
            {uz.metrics.ads} {fmtUZS(book.adSpendUZS)} · {uz.metrics.blogger}{" "}
            {fmtUZS(book.bloggerUZS)} · {uz.metrics.production}{" "}
            {fmtUZS(book.productionUZS)}
          </p>

          <span className="text-xs text-muted-foreground">
            {uz.bookDetail.launch}: {fmtDate(book.launchDate)}
          </span>
        </CardContent>
      </Card>

      {/* Ledger */}
      <Card className="w-full pb-0 pt-6 gap-6 ring-0 border rounded-2xl">
        <CardHeader className="px-6 flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="leading-normal">
              {uz.bookDetail.ledgerTitle}
            </CardTitle>
            <CardDescription>{uz.bookDetail.breakdownTitle}</CardDescription>
          </div>
          <CreateSpendSheet bookId={book.id} />
        </CardHeader>
        <CardContent className="px-0">
          {spend.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
              <p className="text-sm font-medium text-card-foreground">
                {uz.bookDetail.empty}
              </p>
              <p className="text-xs text-muted-foreground">
                {uz.bookDetail.emptyBody}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-2xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.bookDetail.colType}
                    </TableHead>
                    <TableHead className="p-2">
                      {uz.bookDetail.colAmount}
                    </TableHead>
                    <TableHead className="p-2">
                      {uz.bookDetail.colVendor}
                    </TableHead>
                    <TableHead className="p-2">
                      {uz.bookDetail.colPromo}
                    </TableHead>
                    <TableHead className="p-2">
                      {uz.bookDetail.colDate}
                    </TableHead>
                    <TableHead className="p-3 pe-6 text-right">
                      {uz.bookDetail.colActions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {spend.map((row) => {
                    const tc = typeChip(row.type);
                    return (
                      <TableRow key={row.id}>
                        <TableCell className="whitespace-nowrap p-3 ps-6">
                          <Badge className={cn("font-normal", tc.cls)}>
                            {tc.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap p-2 text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium text-card-foreground">
                              {fmtUZS(row.amountUZS)}
                            </span>
                            {row.currency !== "UZS" && (
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {row.amount} {row.currency}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap p-2 text-sm">
                          {row.vendor ?? uz.common.dash}
                        </TableCell>
                        <TableCell className="whitespace-nowrap p-2 text-sm">
                          {row.promoCode ?? uz.common.dash}
                        </TableCell>
                        <TableCell className="whitespace-nowrap p-2 text-sm">
                          {fmtDate(row.spentAt)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap p-3 pe-6">
                          <div className="flex items-center justify-end gap-2">
                            <EditSpendSheet row={row} />
                            {row.canDelete && (
                              <DeleteSpendButton id={row.id} />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
