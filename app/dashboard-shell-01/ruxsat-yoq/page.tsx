import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import { NoAccess } from "@/components/shadcn-space/blocks/dashboard-shell-01/placeholder";

export default function Page() {
  return (
    <AppSidebar>
      <NoAccess />
    </AppSidebar>
  );
}
