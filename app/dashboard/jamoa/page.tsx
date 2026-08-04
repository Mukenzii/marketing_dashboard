import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import TeamView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/team-view";
import { requireCeo } from "@/lib/dal/context";
import { listManagerSummaries } from "@/lib/dal/team";
import { listRoles } from "@/lib/dal/admin";

export default async function Page() {
  await requireCeo();
  const [managers, roles] = await Promise.all([
    listManagerSummaries(),
    listRoles(),
  ]);
  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <TeamView managers={managers} roles={roles} />
      </div>
    </AppSidebar>
  );
}
