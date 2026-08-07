import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import CreativesBoard from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/creatives-board";
import { listCreatives } from "@/lib/dal/campaigns";
import { requireUser } from "@/lib/dal/context";

export default async function Page() {
  // Creatives is open to every authenticated role (incl. content_team — this is
  // their landing page, so it must NOT use requireDashboardAccess or it would
  // redirect content_team here in an infinite loop).
  await requireUser();
  const creatives = await listCreatives();

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <CreativesBoard creatives={creatives} />
      </div>
    </AppSidebar>
  );
}
