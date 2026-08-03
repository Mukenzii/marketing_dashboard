"use client";

import React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import Logo from "@/assets/logo/logo";
import { NavMain } from "@/components/shadcn-space/blocks/dashboard-shell-01/nav-main";
import { SiteHeader } from "@/components/shadcn-space/blocks/dashboard-shell-01/site-header";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import type { NavItem } from "@/lib/nav";
import type { SessionUser } from "@/components/shadcn-space/blocks/dashboard-shell-01/site-header";
import type { NotifyAlert } from "@/components/shadcn-space/blocks/dashboard-shell-01/notification-dropdown";

export function DashboardShell({
  user,
  nav,
  alerts,
  children,
}: {
  user: SessionUser;
  nav: NavItem[];
  alerts: NotifyAlert[];
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar className="py-4 px-0 bg-background">
        <div className="flex flex-col gap-6 bg-background">
          {/* ---------------- Header ---------------- */}
          <SidebarHeader className="py-0 px-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" className="w-full h-full">
                  <Logo />
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          {/* ---------------- Content ---------------- */}
          <SidebarContent className="overflow-hidden gap-0 px-0">
            <SimpleBar autoHide={true} className="h-[calc(100vh-120px)]">
              <div className="px-4">
                <NavMain items={nav} />
              </div>
            </SimpleBar>
          </SidebarContent>
        </div>
      </Sidebar>

      {/* ---------------- Main ---------------- */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex items-center border-b px-6 py-3 bg-background">
          <SiteHeader user={user} alerts={alerts} />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
