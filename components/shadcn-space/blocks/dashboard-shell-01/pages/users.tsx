"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  changeRoleAction,
  inviteUserAction,
  setUserStatusAction,
} from "@/lib/actions/users";
import type { ActionResult } from "@/lib/actions/util";
import type { AdminUserRow } from "@/lib/dal/admin";
import { fmtDate, fmtNumber, uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";

type Role = { key: string; name: string; isPrivileged: boolean };

const INITIAL: ActionResult = { ok: false };
const selectClass =
  "w-full rounded-md border bg-background px-3 py-2 text-sm";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-foreground">{children}</label>
  );
}

/* ------------------------------- row actions ------------------------------ */

function UserRowActions({
  user,
  roles,
  isSelf,
}: {
  user: AdminUserRow;
  roles: Role[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [statusPending, startStatus] = useTransition();
  const [rolePending, startRole] = useTransition();
  const [roleOpen, setRoleOpen] = useState(false);
  const [role, setRole] = useState(user.role);

  function toggleStatus() {
    startStatus(async () => {
      const res = await setUserStatusAction(
        user.id,
        user.status === "active" ? "inactive" : "active",
      );
      if (!res.ok) window.alert(res.error);
      else router.refresh();
    });
  }

  function submitRole() {
    startRole(async () => {
      const res = await changeRoleAction(user.id, role);
      if (!res.ok) {
        window.alert(res.error);
      } else {
        setRoleOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" />}
          disabled={statusPending}
        >
          <MoreVertical />
          <span className="sr-only">{uz.users.actionsLabel}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isSelf && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-muted-foreground">
                  {uz.users.selfHint}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            disabled={isSelf || statusPending}
            onClick={toggleStatus}
          >
            {user.status === "active"
              ? uz.users.deactivate
              : uz.users.activate}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isSelf}
            onClick={() => {
              setRole(user.role);
              setRoleOpen(true);
            }}
          >
            {uz.users.changeRole}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={roleOpen} onOpenChange={setRoleOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{uz.users.changeRole}</SheetTitle>
            <SheetDescription>{uz.users.changeRoleDesc}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>{uz.users.fRole}</FieldLabel>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={selectClass}
              >
                {roles.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" disabled={rolePending} onClick={submitRole}>
                {rolePending ? uz.users.saving : uz.users.save}
              </Button>
              <SheetClose render={<Button type="button" variant="outline" />}>
                {uz.users.cancel}
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/* ------------------------------- invite user ------------------------------ */

function genPassword(): string {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const arr = new Uint32Array(14);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

function InviteUserSheet({ roles }: { roles: Role[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [pwd, setPwd] = useState("");
  const [state, formAction, pending] = useActionState(
    inviteUserAction,
    INITIAL,
  );

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
          {state.error && (
            <p className="text-sm text-rose-500">{state.error}</p>
          )}
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

/* --------------------------------- view ----------------------------------- */

export default function UsersView({
  users,
  roles,
  currentUserId,
}: {
  users: AdminUserRow[];
  roles: Role[];
  currentUserId: string | null;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {uz.nav.users}
          </h1>
          <p className="text-sm text-muted-foreground">{uz.users.subtitle}</p>
        </div>
        <InviteUserSheet roles={roles} />
      </div>

      <Card className="w-full pt-6 pb-0 gap-6">
        <CardHeader className="px-6">
          <CardTitle>{uz.nav.users}</CardTitle>
          <CardDescription>{uz.users.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {users.length === 0 ? (
            <div className="px-6 pb-6 text-center">
              <p className="text-sm font-medium text-foreground">
                {uz.users.empty}
              </p>
              <p className="text-sm text-muted-foreground">
                {uz.users.emptyBody}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-2xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.users.colUser}
                    </TableHead>
                    <TableHead className="p-2">{uz.users.colRole}</TableHead>
                    <TableHead className="p-2">{uz.users.colBooks}</TableHead>
                    <TableHead className="p-2">{uz.users.colStatus}</TableHead>
                    <TableHead className="p-2">
                      {uz.users.colLastLogin}
                    </TableHead>
                    <TableHead className="p-3 pe-6 text-end">
                      {uz.users.colActions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="whitespace-nowrap p-3 ps-6">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{initials(u.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h6 className="text-sm font-medium text-foreground">
                              {u.name}
                            </h6>
                            <p className="text-xs text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2">
                        <Badge className="bg-blue-500/10 text-blue-600">
                          {u.roleLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm text-foreground">
                        {fmtNumber(u.bookCount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2">
                        <Badge
                          className={cn(
                            u.status === "active"
                              ? "bg-teal-400/10 text-teal-600"
                              : "bg-rose-500/10 text-rose-500",
                          )}
                        >
                          {u.status === "active"
                            ? uz.users.active
                            : uz.users.inactive}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm text-muted-foreground">
                        {u.lastLoginAt ? fmtDate(u.lastLoginAt) : uz.common.dash}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-3 pe-6 text-end">
                        <div className="flex justify-end">
                          <UserRowActions
                            user={u}
                            roles={roles}
                            isSelf={u.id === currentUserId}
                          />
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
