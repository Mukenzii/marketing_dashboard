import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import UsersView from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/users";
import { listRoles, listUsers } from "@/lib/dal/admin";
import { getCurrentUser, requireCeoOnly } from "@/lib/dal/context";

export default async function Page() {
  await requireCeoOnly();
  const [users, roles, current] = await Promise.all([
    listUsers(),
    listRoles(),
    getCurrentUser(),
  ]);
  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <UsersView
          users={users}
          roles={roles}
          currentUserId={current?.id ?? null}
        />
      </div>
    </AppSidebar>
  );
}
