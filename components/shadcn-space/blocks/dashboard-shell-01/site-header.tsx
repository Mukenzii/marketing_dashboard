import { SidebarTrigger } from "@/components/ui/sidebar";
import UserDropdown from "@/components/shadcn-space/blocks/dashboard-shell-01/user-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import NotificationDropdown, {
  type NotifyAlert,
} from "@/components/shadcn-space/blocks/dashboard-shell-01/notification-dropdown";
import { BellRing } from "lucide-react";
import HeaderSearch from "@/components/shadcn-space/blocks/dashboard-shell-01/header-search";
import { cn } from "@/lib/utils";

export type SessionUser = {
  name: string;
  email: string;
  image: string | null;
  roleLabel: string;
};

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

export function SiteHeader({
  user,
  alerts = [],
}: {
  user: SessionUser;
  alerts?: NotifyAlert[];
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 h-8 w-8 cursor-pointer" />
        <HeaderSearch />
      </div>
      <div className="flex items-center gap-3">
        <NotificationDropdown
          alerts={alerts}
          defaultOpen={false}
          align="center"
          trigger={
            <div
              className={cn(
                "rounded-full p-2 hover:bg-accent relative cursor-pointer",
                alerts.length > 0 &&
                  "before:absolute before:bottom-0 before:left-1/2 before:z-10 before:w-2 before:h-2 before:rounded-full before:bg-rose-500 before:top-1",
              )}
            >
              <BellRing className="size-4" />
            </div>
          }
        />
        <UserDropdown
          user={user}
          defaultOpen={false}
          align="center"
          trigger={
            <div className="rounded-full">
              <Avatar className="size-8 cursor-pointer">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-blue-500/15 text-blue-600 text-xs font-semibold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
          }
        />
      </div>
    </div>
  );
}
