import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import CreativesBoard from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/creatives-board";
import { listCreatives } from "@/lib/dal/campaigns";
import { requireDashboardAccess } from "@/lib/dal/context";

export default async function Page() {
  await requireDashboardAccess();
  const creatives = await listCreatives();

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <CreativesBoard creatives={creatives} />
      </div>
    </AppSidebar>
  );
}
