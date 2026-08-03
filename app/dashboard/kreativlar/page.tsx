import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import CreativesTable from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/creatives-table";
import { listCreatives } from "@/lib/dal/campaigns";

export default async function Page() {
  const creatives = await listCreatives();

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <CreativesTable creatives={creatives} />
      </div>
    </AppSidebar>
  );
}
