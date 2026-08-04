import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import BudgetsView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/budgets";
import { listBooks } from "@/lib/dal/books";
import { listUsers } from "@/lib/dal/admin";
import { requireCeo } from "@/lib/dal/context";

// Roles that own books (the assignable owners in the budget form).
const MANAGER_ROLES = new Set(["pr_manager", "smm_manager"]);

export default async function Page() {
  await requireCeo();
  const [books, users] = await Promise.all([listBooks(), listUsers()]);

  const managers = users
    .filter((u) => MANAGER_ROLES.has(u.role))
    .map((u) => ({ id: u.id, name: u.name }));

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <BudgetsView books={books} users={managers} />
      </div>
    </AppSidebar>
  );
}
