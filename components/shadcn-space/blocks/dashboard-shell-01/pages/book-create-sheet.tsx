"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createBookAction } from "@/lib/actions/books";
import type { ActionResult } from "@/lib/actions/util";
import { uz } from "@/lib/i18n/uz";

const INITIAL: ActionResult = { ok: false };

const selectClass =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="text-sm font-medium text-foreground">
      {children}
      {hint && (
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          ({hint})
        </span>
      )}
    </label>
  );
}

/**
 * Self-service "add book" for PR managers (and privileged users) on the Kitoblar
 * page. Fields mirror the book-tracker sheet. Ownership is handled server-side:
 * a non-privileged user always owns the book they create.
 */
export default function BookCreateSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createBookAction,
    INITIAL,
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state, router]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>{uz.books.add}</SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{uz.books.createTitle}</SheetTitle>
          <SheetDescription>{uz.books.createDesc}</SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 px-4 pb-6">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.books.fTitle}</FieldLabel>
            <Input name="title" className="h-9" autoFocus />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.books.fBrand}</FieldLabel>
            <select
              name="brand"
              defaultValue="falaq_nashr"
              className={selectClass}
            >
              <option value="falaq_nashr">{uz.brands.falaq_nashr}</option>
              <option value="falaq_kids">{uz.brands.falaq_kids}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.books.fCategory}</FieldLabel>
            <select name="category" defaultValue="" className={selectClass}>
              <option value="">{uz.tracker.categoryAuto}</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="new">{uz.tracker.catNew}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel hint={uz.books.optional}>
                {uz.books.fPrintRun}
              </FieldLabel>
              <Input name="printRun" type="number" min={0} step={1} className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel hint={uz.books.optional}>
                {uz.books.fTargetSales}
              </FieldLabel>
              <Input name="targetSales" type="number" min={0} step={1} className="h-9" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel hint={uz.books.optional}>
                {uz.books.fSalesPrev}
              </FieldLabel>
              <Input name="salesPrevMonth" type="number" min={0} step={1} className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel hint={uz.books.optional}>
                {uz.books.fSalesNow}
              </FieldLabel>
              <Input name="salesCount" type="number" min={0} step={1} className="h-9" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.books.fBudget}</FieldLabel>
            <Input
              name="budget"
              type="number"
              min={0}
              step={1}
              defaultValue="0"
              className="h-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel hint={uz.books.optional}>
                {uz.books.fTargetBudget}
              </FieldLabel>
              <Input name="targetBudget" type="number" min={0} step={1} className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel hint={uz.books.optional}>
                {uz.books.fTargetOther}
              </FieldLabel>
              <Input name="targetOtherBook" type="number" min={0} step={1} className="h-9" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel hint={uz.books.optional}>{uz.books.fLaunch}</FieldLabel>
            <Input name="launchDate" type="date" className="h-9" />
          </div>

          {state.error && <p className="text-sm text-rose-500">{state.error}</p>}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? uz.books.creating : uz.books.create}
            </Button>
            <SheetClose render={<Button type="button" variant="outline" />}>
              {uz.books.cancel}
            </SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
