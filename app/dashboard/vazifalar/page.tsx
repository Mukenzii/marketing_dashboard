import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import TasksBoard from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/tasks-board";
import { listTasks } from "@/lib/dal/tasks";
import { listBooks } from "@/lib/dal/books";
import { listUsers } from "@/lib/dal/admin";
import { getCurrentUser } from "@/lib/dal/context";

export default async function Page() {
  const user = await getCurrentUser();
  const isPrivileged = !!user?.isPrivileged;

  const [tasks, books, users] = await Promise.all([
    listTasks(),
    listBooks(),
    isPrivileged ? listUsers() : Promise.resolve([]),
  ]);

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[1400px] p-6 flex flex-col gap-6">
        <TasksBoard
          tasks={tasks}
          books={books.map((b) => ({ id: b.id, title: b.title }))}
          users={users.map((u) => ({ id: u.id, name: u.name }))}
          isPrivileged={isPrivileged}
        />
      </div>
    </AppSidebar>
  );
}
