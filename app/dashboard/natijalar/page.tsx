import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import ResultsView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/results-view";
import { listCampaigns } from "@/lib/dal/campaigns";
import { requireDashboardAccess } from "@/lib/dal/context";

export default async function Page() {
  await requireDashboardAccess();
  const campaigns = await listCampaigns();
  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <ResultsView campaigns={campaigns} />
      </div>
    </AppSidebar>
  );
}
