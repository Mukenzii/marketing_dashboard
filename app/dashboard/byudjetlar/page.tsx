import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import BudgetsView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/budgets";
import { listBooks } from "@/lib/dal/books";
import { listRoles, listUsers } from "@/lib/dal/admin";
import { requireCeo } from "@/lib/dal/context";

export default async function Page() {
  await requireCeo();
  const [books, users, roles] = await Promise.all([
    listBooks(),
    listUsers(),
    listRoles(),
  ]);

  const privileged = new Set(
    roles.filter((r) => r.isPrivileged).map((r) => r.key),
  );
  const managers = users
    .filter((u) => !privileged.has(u.role))
    .map((u) => ({ id: u.id, name: u.name }));

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <BudgetsView books={books} users={managers} />
      </div>
    </AppSidebar>
  );
}
