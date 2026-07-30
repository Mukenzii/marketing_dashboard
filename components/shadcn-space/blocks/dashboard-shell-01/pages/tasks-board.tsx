"use client";

import { useEffect, useState, useTransition, useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  TableProperties,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { uz, fmtDate } from "@/lib/i18n/uz";
import type { TaskRow } from "@/lib/dal/tasks";
import type { ActionResult } from "@/lib/actions/util";
import {
  createTaskAction,
  updateTaskStatusAction,
} from "@/lib/actions/tasks";

type Status = TaskRow["status"];
type Priority = TaskRow["priority"];

type BookOption = { id: string; title: string };
type UserOption = { id: string; name: string };

type BoardProps = {
  tasks: TaskRow[];
  books: BookOption[];
  users: UserOption[];
  isPrivileged: boolean;
};

const SELECT_CLASS =
  "w-full rounded-md border bg-background px-3 py-2 text-sm";

const STATUS_ORDER: Status[] = [
  "todo",
  "in_progress",
  "review",
  "done",
  "blocked",
];

const STATUS_ACCENT: Record<Status, string> = {
  todo: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/10 text-blue-600",
  review: "bg-violet-500/10 text-violet-600",
  done: "bg-teal-400/10 text-teal-600",
  blocked: "bg-rose-500/10 text-rose-500",
};

const STATUS_DOT: Record<Status, string> = {
  todo: "bg-muted-foreground",
  in_progress: "bg-blue-500",
  review: "bg-violet-500",
  done: "bg-teal-400",
  blocked: "bg-rose-500",
};

const PRIORITY_BADGE: Record<Priority, string> = {
  low: "bg-muted text-muted-foreground",
  normal: "bg-blue-500/10 text-blue-600",
  high: "bg-orange-400/10 text-orange-600",
};

function initials(name: string | null): string {
  if (!name) return "—";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function PriorityChip({ priority }: { priority: Priority }) {
  return (
    <Badge className={cn("font-normal", PRIORITY_BADGE[priority])}>
      {uz.tasks.priority[priority]}
    </Badge>
  );
}

function AssigneeCell({ name }: { name: string | null }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar size="sm">
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <span className="text-sm text-foreground">
        {name ?? uz.tasks.unassigned}
      </span>
    </div>
  );
}

function StatusControl({ task }: { task: TaskRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function select(status: Status) {
    if (status === task.status || pending) return;
    setError(null);
    startTransition(async () => {
      const res = await updateTaskStatusAction(task.id, status);
      if (!res.ok) {
        setError(res.error ?? uz.tasks.status[task.status]);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={uz.tasks.changeStatus}
          render={
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              className={cn("gap-1.5 font-normal", STATUS_ACCENT[task.status])}
            />
          }
        >
          <span className={cn("size-2 rounded-full", STATUS_DOT[task.status])} />
          {uz.tasks.status[task.status]}
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {STATUS_ORDER.map((s) => (
            <DropdownMenuItem
              key={s}
              onClick={() => select(s)}
              className="gap-2"
            >
              <span className={cn("size-2 rounded-full", STATUS_DOT[s])} />
              {uz.tasks.status[s]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
}

function TaskCard({ task }: { task: TaskRow }) {
  return (
    <Card className="p-0 gap-0 rounded-xl shadow-xs">
      <CardContent className="p-4 flex flex-col gap-3">
        <h6 className="text-sm font-medium leading-snug text-foreground">
          {task.title}
        </h6>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge className="bg-muted text-muted-foreground font-normal gap-1">
            <BookOpen className="size-3" />
            {task.bookTitle ?? uz.tasks.noBook}
          </Badge>
          <PriorityChip priority={task.priority} />
          {task.isOverdue && (
            <Badge className="bg-rose-500/10 text-rose-500 font-normal">
              {uz.common.overdue}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <AssigneeCell name={task.assigneeName} />
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              task.isOverdue ? "text-rose-500" : "text-muted-foreground",
            )}
          >
            <CalendarDays className="size-3" />
            {task.dueDate ? fmtDate(task.dueDate) : uz.tasks.noDue}
          </span>
        </div>

        <div className="pt-1">
          <StatusControl task={task} />
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanView({ tasks }: { tasks: TaskRow[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max">
        {STATUS_ORDER.map((status) => {
          const items = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="w-72 shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      STATUS_DOT[status],
                    )}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {uz.tasks.status[status]}
                  </span>
                </div>
                <Badge className={cn("font-normal", STATUS_ACCENT[status])}>
                  {items.length}
                </Badge>
              </div>
              <div className="flex flex-col gap-3">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-1 py-6 text-center">
                    —
                  </p>
                ) : (
                  items.map((t) => <TaskCard key={t.id} task={t} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TableView({ tasks }: { tasks: TaskRow[] }) {
  return (
    <Card className="w-full pb-0 pt-6 gap-6">
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="min-w-3xl">
            <TableHeader>
              <TableRow className="hover:bg-transparent!">
                <TableHead className="p-3 ps-6">{uz.tasks.colTask}</TableHead>
                <TableHead className="p-2">{uz.tasks.colBook}</TableHead>
                <TableHead className="p-2">{uz.tasks.colAssignee}</TableHead>
                <TableHead className="p-2">{uz.tasks.colStatus}</TableHead>
                <TableHead className="p-2">{uz.tasks.colPriority}</TableHead>
                <TableHead className="p-3 pe-6">{uz.tasks.colDue}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border dark:divide-darkborder">
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="whitespace-nowrap p-3 ps-6">
                    <span className="text-sm font-medium text-foreground">
                      {task.title}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">
                      {task.bookTitle ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <AssigneeCell name={task.assigneeName} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusControl task={task} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <PriorityChip priority={task.priority} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-3 pe-6">
                    {task.dueDate ? (
                      <span
                        className={cn(
                          "text-sm",
                          task.isOverdue
                            ? "text-rose-500 font-medium"
                            : "text-foreground",
                        )}
                      >
                        {fmtDate(task.dueDate)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <TableProperties className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">{uz.tasks.empty}</p>
        <p className="text-xs text-muted-foreground">{uz.tasks.emptyBody}</p>
      </CardContent>
    </Card>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-foreground">
      {children}
      {required && <span className="text-rose-500"> *</span>}
    </label>
  );
}

function CreateTaskSheet({
  books,
  users,
  isPrivileged,
}: {
  books: BookOption[];
  users: UserOption[];
  isPrivileged: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createTaskAction,
    { ok: false } as ActionResult,
  );

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button className="gap-1.5" />}>
        {uz.tasks.newTask}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{uz.tasks.formTitle}</SheetTitle>
          <SheetDescription>{uz.tasks.formSubtitle}</SheetDescription>
        </SheetHeader>

        <form action={formAction} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>{uz.tasks.fieldTitle}</FieldLabel>
              <Input name="title" required className="h-9" />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>{uz.tasks.fieldDescription}</FieldLabel>
              <Textarea name="description" rows={3} />
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>{uz.tasks.fieldBook}</FieldLabel>
              <select name="bookId" defaultValue="" className={SELECT_CLASS}>
                <option value="">{uz.tasks.noBook}</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>{uz.tasks.fieldPriority}</FieldLabel>
                <select
                  name="priority"
                  defaultValue="normal"
                  className={SELECT_CLASS}
                >
                  <option value="low">{uz.tasks.priority.low}</option>
                  <option value="normal">{uz.tasks.priority.normal}</option>
                  <option value="high">{uz.tasks.priority.high}</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel>{uz.tasks.fieldStatus}</FieldLabel>
                <select
                  name="status"
                  defaultValue="todo"
                  className={SELECT_CLASS}
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {uz.tasks.status[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <FieldLabel>{uz.tasks.fieldDue}</FieldLabel>
              <Input type="date" name="dueDate" className="h-9" />
            </div>

            {isPrivileged && (
              <div className="flex flex-col gap-1.5">
                <FieldLabel>{uz.tasks.fieldAssignee}</FieldLabel>
                <select
                  name="assigneeId"
                  defaultValue=""
                  className={SELECT_CLASS}
                >
                  <option value="">{uz.tasks.unassigned}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {state.error && (
              <p className="text-sm text-rose-500">{state.error}</p>
            )}
          </div>

          <SheetFooter className="border-t">
            <div className="flex items-center justify-end gap-2">
              <SheetClose render={<Button type="button" variant="outline" />}>
                {uz.tasks.cancel}
              </SheetClose>
              <Button type="submit" disabled={pending}>
                {pending ? uz.tasks.creating : uz.tasks.create}
              </Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default function TasksBoard({
  tasks,
  books,
  users,
  isPrivileged,
}: BoardProps) {
  const [view, setView] = useState<"kanban" | "table">("kanban");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-foreground">
            {uz.nav.tasks}
          </h1>
          <p className="text-xs text-muted-foreground">{uz.tasks.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setView("kanban")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors",
              view === "kanban"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-4" />
            {uz.tasks.viewKanban}
          </button>
          <button
            type="button"
            onClick={() => setView("table")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm cursor-pointer transition-colors",
              view === "table"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <TableProperties className="size-4" />
            {uz.tasks.viewTable}
          </button>
        </div>
        <CreateTaskSheet
          books={books}
          users={users}
          isPrivileged={isPrivileged}
        />
        </div>
      </div>

      {tasks.length === 0 ? (
        <EmptyState />
      ) : view === "kanban" ? (
        <KanbanView tasks={tasks} />
      ) : (
        <TableView tasks={tasks} />
      )}
    </div>
  );
}
