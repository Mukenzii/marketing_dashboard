import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import ChartsPage from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/charts";

export default function Page() {
  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <ChartsPage />
      </div>
    </AppSidebar>
  );
}
