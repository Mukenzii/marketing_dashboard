"use client";

import {
  ChevronRight,
  LayoutDashboard,
  Clapperboard,
  BookOpen,
  ListChecks,
  TrendingUp,
  Megaphone,
  Users,
  Wallet,
  UserCog,
  Settings,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import type { NavItem, NavIconKey } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// Resolve the serializable iconKey (sent from the server) to a client icon.
const NAV_ICONS: Record<NavIconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  creatives: Clapperboard,
  books: BookOpen,
  tasks: ListChecks,
  results: TrendingUp,
  campaigns: Megaphone,
  team: Users,
  budgets: Wallet,
  users: UserCog,
  settings: Settings,
  audit: ScrollText,
};

function NavIcon({
  iconKey,
  size,
  className,
}: {
  iconKey?: NavIconKey;
  size?: number;
  className?: string;
}) {
  if (!iconKey) return null;
  const Icon = NAV_ICONS[iconKey];
  return Icon ? <Icon size={size} className={className} /> : null;
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  // Recursive render function
  const renderItem = (item: NavItem) => {
    //  Section label
    if (item.isSection && item.label) {
      return (
        <SidebarGroup key={item.label} className="p-0 pt-5 first:pt-0">
          <SidebarGroupLabel className="p-0 text-xs font-medium uppercase text-sidebar-foreground">
            {item.label}
          </SidebarGroupLabel>
        </SidebarGroup>
      );
    }
    const hasChildren = !!item.children?.length;
    // Item with children → collapsible
    if (hasChildren && item.title) {
      return (
        <SidebarGroup key={item.title} className="p-0">
          <SidebarMenu>
            <Collapsible>
              <SidebarMenuItem>
                <CollapsibleTrigger
                  render={
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="rounded-xl text-sm px-3 py-2 h-9 cursor-pointer"
                    >
                      <NavIcon iconKey={item.iconKey} size={16} />
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 collapsible/button-[aria-expanded='true']:rotate-90" />
                    </SidebarMenuButton>
                  }
                  className="w-full collapsible/button"
                />
                <CollapsibleContent>
                  <SidebarMenuSub className="me-0 pe-0">
                    {item.children!.map(renderItemSub)}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroup>
      );
    }
    // Item without children
    if (item.title) {
      const isActive = item.isActive ?? pathname === item.href;

      return (
        <SidebarGroup key={item.title} className="p-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={item.title}
                className={cn(
                  "rounded-lg text-sm px-3 py-2 h-9 ",
                  isActive
                    ? "bg-primary hover:bg-primary dark:bg-blue-500 text-white dark:hover:bg-blue-500 hover:text-white"
                    : "",
                )}
              >
                <NavIcon iconKey={item.iconKey} size={16} />
                <a href={item.href} className="w-full">
                  {item.title}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      );
    }
    return null;
  };
  // Recursive render function for sub-items
  const renderItemSub = (item: NavItem) => {
    const hasChildren = !!item.children?.length;
    if (hasChildren && item.title) {
      return (
        <SidebarMenuSubItem key={item.title}>
          <Collapsible>
            <CollapsibleTrigger className="w-full">
              <SidebarMenuSubButton className="rounded-xl text-sm px-3 py-2 h-9">
                <NavIcon iconKey={item.iconKey} size={16} />
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 data-[state=open]:rotate-90" />
              </SidebarMenuSubButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="me-0 pe-0">
                {item.children!.map(renderItemSub)}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuSubItem>
      );
    }
    if (item.title) {
      return (
        <SidebarMenuSubItem key={item.title} className="w-full">
          <SidebarMenuSubButton
            className="w-full"
            render={<a href={item.href}>{item.title}</a>}
          />
        </SidebarMenuSubItem>
      );
    }
    return null;
  };

  return <>{items.map(renderItem)}</>;
}
