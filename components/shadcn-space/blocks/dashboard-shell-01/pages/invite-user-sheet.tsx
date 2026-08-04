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
import { inviteUserAction } from "@/lib/actions/users";
import type { ActionResult } from "@/lib/actions/util";
import { uz } from "@/lib/i18n/uz";

export type Role = { key: string; name: string; isPrivileged: boolean };

const INITIAL: ActionResult = { ok: false };
const selectClass = "w-full rounded-md border bg-background px-3 py-2 text-sm";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-foreground">{children}</label>
  );
}

function genPassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = new Uint32Array(14);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

/**
 * "Add member" sheet — a CEO creates a user with an inline-set password so they
 * can sign in immediately. Shared by the Foydalanuvchilar and Jamoa pages.
 */
export default function InviteUserSheet({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [pwd, setPwd] = useState("");
  const [state, formAction, pending] = useActionState(inviteUserAction, INITIAL);

  useEffect(() => {
    if (state.ok) {
      setSent(true);
      const t = setTimeout(() => {
        setOpen(false);
        router.refresh();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  const defaultRole =
    roles.find((r) => !r.isPrivileged)?.key ?? roles[0]?.key ?? "";

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          setSent(false);
          setPwd(genPassword());
        }
      }}
    >
      <SheetTrigger render={<Button />}>{uz.users.invite}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{uz.users.inviteTitle}</SheetTitle>
          <SheetDescription>{uz.users.inviteDesc}</SheetDescription>
        </SheetHeader>
        <form action={formAction} className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.users.fName}</FieldLabel>
            <Input name="name" className="h-9" />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.users.fEmail}</FieldLabel>
            <Input name="email" type="email" className="h-9" />
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.users.fRole}</FieldLabel>
            <select name="role" defaultValue={defaultRole} className={selectClass}>
              {roles.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{uz.users.fPassword}</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                name="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                minLength={8}
                className="h-9 font-mono"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPwd(genPassword())}
              >
                {uz.users.generate}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {uz.users.passwordHint}
            </p>
          </div>
          {state.error && <p className="text-sm text-rose-500">{state.error}</p>}
          {sent && (
            <p className="text-sm text-teal-600">{uz.users.inviteSuccess}</p>
          )}
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={pending || sent}>
              {pending ? uz.users.sending : uz.users.invite}
            </Button>
            <SheetClose render={<Button type="button" variant="outline" />}>
              {uz.users.cancel}
            </SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
