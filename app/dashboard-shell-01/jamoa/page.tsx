import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import TeamView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/team-view";
import { requireCeo } from "@/lib/dal/context";
import { listManagerSummaries } from "@/lib/dal/team";

export default async function Page() {
  await requireCeo();
  const managers = await listManagerSummaries();
  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <TeamView managers={managers} />
      </div>
    </AppSidebar>
  );
}
