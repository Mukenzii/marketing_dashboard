import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import CampaignsView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/campaigns-view";
import { requireCeo } from "@/lib/dal/context";
import { listCampaigns } from "@/lib/dal/campaigns";

export default async function Page() {
  await requireCeo();
  const campaigns = await listCampaigns();
  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <CampaignsView campaigns={campaigns} />
      </div>
    </AppSidebar>
  );
}
