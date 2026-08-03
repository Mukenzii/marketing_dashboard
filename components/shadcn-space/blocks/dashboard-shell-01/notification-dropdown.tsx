"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, XCircle, Info, CheckCheck } from "lucide-react";
import { uz } from "@/lib/i18n/uz";
import {
  markAllReadAction,
  markReadAction,
} from "@/lib/actions/notifications";

export type NotifyAlert = {
  id: string;
  tone: "alert" | "warn" | "info";
  title: string;
  desc: string;
  link?: string | null;
};

type Props = {
  alerts: NotifyAlert[];
  trigger: ReactNode;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
};

const TONE = {
  alert: { bg: "bg-rose-500/10", fg: "text-rose-500", Icon: XCircle },
  warn: { bg: "bg-orange-400/10", fg: "text-orange-600", Icon: AlertTriangle },
  info: { bg: "bg-blue-500/10", fg: "text-blue-600", Icon: Info },
};

const NotificationDropdown = ({
  alerts,
  trigger,
  defaultOpen,
  align = "end",
}: Props) => {
  const router = useRouter();
  const [pending, start] = useTransition();

  function openItem(a: NotifyAlert) {
    start(async () => {
      await markReadAction(a.id);
      if (a.link) router.push(a.link);
      else router.refresh();
    });
  }

  function readAll() {
    start(async () => {
      await markAllReadAction();
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-center">
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent align={align} className="p-0 w-sm rounded-2xl">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center justify-between p-4">
              <p className="text-base font-medium text-popover-foreground">
                {uz.notifications.title}
              </p>
              {alerts.length > 0 && (
                <Badge className="font-normal leading-0">{alerts.length}</Badge>
              )}
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuGroup>
            {alerts.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {uz.notifications.empty}
              </div>
            ) : (
              alerts.map((a) => {
                const t = TONE[a.tone];
                return (
                  <DropdownMenuItem
                    key={a.id}
                    disabled={pending}
                    onClick={() => openItem(a)}
                    className="mx-1.5 my-1 p-2 flex items-center gap-3 cursor-pointer"
                  >
                    <div className={cn("p-2.5 rounded-xl", t.bg, t.fg)}>
                      <t.Icon size={20} className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-popover-foreground">
                        {a.title}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {a.desc}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })
            )}
          </DropdownMenuGroup>

          {alerts.length > 0 && (
            <div className="mx-1.5 my-1 p-2">
              <Button
                variant="outline"
                disabled={pending}
                onClick={readAll}
                className="rounded-xl w-full cursor-pointer h-9 gap-2"
              >
                <CheckCheck className="size-4" />
                {uz.notifications.markAllRead}
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationDropdown;
