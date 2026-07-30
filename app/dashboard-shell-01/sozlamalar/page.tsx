import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import SettingsView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/settings";
import { listThresholds } from "@/lib/dal/admin";
import { requireCeo } from "@/lib/dal/context";

export default async function Page() {
  await requireCeo();
  const thresholds = await listThresholds();
  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <SettingsView thresholds={thresholds} />
      </div>
    </AppSidebar>
  );
}
