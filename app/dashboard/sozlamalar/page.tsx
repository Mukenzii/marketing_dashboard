import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import SettingsView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/settings";
import MetaSyncCard from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/meta-sync-card";
import { listThresholds, latestSyncRun } from "@/lib/dal/admin";
import { requireCeoOnly } from "@/lib/dal/context";

export default async function Page() {
  await requireCeoOnly();
  const [thresholds, lastSync] = await Promise.all([
    listThresholds(),
    latestSyncRun(),
  ]);
  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <MetaSyncCard last={lastSync} />
        <SettingsView thresholds={thresholds} />
      </div>
    </AppSidebar>
  );
}
