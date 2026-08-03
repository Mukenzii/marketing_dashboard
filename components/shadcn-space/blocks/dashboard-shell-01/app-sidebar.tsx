import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal/context";
import { listNotifications } from "@/lib/dal/notifications";
import { getNavForRole } from "@/lib/nav";
import { DashboardShell } from "@/components/shadcn-space/blocks/dashboard-shell-01/dashboard-shell";

// NavItem now lives in lib/nav; re-exported for any existing imports.
export type { NavItem } from "@/lib/nav";

/**
 * Server shell. Resolves the session, filters the nav by privilege ON THE
 * SERVER (management items never reach a manager's browser), and hands a
 * plain, non-sensitive user object to the interactive client sidebar.
 * Kept as the default export so every page's <AppSidebar> wrapper is unchanged.
 */
const AppSidebar = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const nav = getNavForRole(user.role);
  const alerts = await listNotifications();

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        roleLabel: user.roleLabel,
      }}
      nav={nav}
      alerts={alerts}
    >
      {children}
    </DashboardShell>
  );
};

export default AppSidebar;
