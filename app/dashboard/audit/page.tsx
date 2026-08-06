import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import AuditView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/audit";
import { listAudit } from "@/lib/dal/admin";
import { requireManagement } from "@/lib/dal/context";

export default async function Page() {
  await requireManagement();
  const rows = await listAudit();
  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <AuditView rows={rows} />
      </div>
    </AppSidebar>
  );
}
