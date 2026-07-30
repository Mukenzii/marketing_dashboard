"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUserRound, Settings, LogOut } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import { logout } from "@/lib/actions/auth";
import {
  initials,
  type SessionUser,
} from "@/components/shadcn-space/blocks/dashboard-shell-01/site-header";

type Props = {
  user: SessionUser;
  trigger: ReactNode;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
};

const itemClass =
  "p-2 text-sm font-medium text-popover-foreground cursor-pointer gap-2";

const UserDropdown = ({ user, trigger, defaultOpen, align = "end" }: Props) => {
  return (
    <div className="flex items-center justify-center">
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="w-3xs rounded-2xl">
          {/* User Info */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-3 px-4 py-3">
              <div className="relative">
                <Avatar className="size-9">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="bg-blue-500/15 text-blue-600 text-xs font-semibold">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="ring-card absolute right-0 bottom-0 size-2 rounded-full bg-green-600 ring-2" />
              </div>

              <div className="flex min-w-0 flex-col">
                <span className="text-popover-foreground truncate text-sm font-medium">
                  {user.name}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
                <Badge className="mt-1 w-fit bg-blue-500/10 text-blue-600 text-[10px] font-medium">
                  {user.roleLabel}
                </Badge>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              className={itemClass}
              render={<Link href="/dashboard-shell-01/profil" />}
            >
              <CircleUserRound size={20} />
              <span>{uz.userMenu.profile}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className={itemClass}
              render={<Link href="/dashboard-shell-01/profil" />}
            >
              <Settings size={20} />
              <span>{uz.userMenu.settings}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          {/* Logout — server action clears the session cookie */}
          <DropdownMenuItem
            variant="destructive"
            className={itemClass}
            onClick={() => {
              void logout();
            }}
          >
            <LogOut size={20} />
            <span>{uz.userMenu.signout}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserDropdown;
