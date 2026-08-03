"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { BloggerRow } from "@/lib/dal/bloggers";
import {
  createBloggerAction,
  updateBloggerAction,
  deleteBloggerAction,
} from "@/lib/actions/bloggers";
import { uz, fmtUZS } from "@/lib/i18n/uz";

type FormState = {
  name: string;
  platform: string;
  budgetAllocated: string;
  spent: string;
  note: string;
};

const empty: FormState = {
  name: "",
  platform: "",
  budgetAllocated: "",
  spent: "",
  note: "",
};

const toForm = (b: BloggerRow): FormState => ({
  name: b.name,
  platform: b.platform ?? "",
  budgetAllocated: String(b.budgetAllocated),
  spent: String(b.spent),
  note: b.note ?? "",
});

function BloggerForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial: FormState;
  onCancel: () => void;
  onSubmit: (f: FormState) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [f, setF] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof FormState) => (v: string) =>
    setF((p) => ({ ...p, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await onSubmit(f);
      if (!res.ok) {
        setError(res.error ?? "Xatolik");
        return;
      }
      onCancel();
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">{uz.bloggers.name}</label>
          <Input value={f.name} onChange={(e) => set("name")(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">{uz.bloggers.platform}</label>
          <Input
            value={f.platform}
            onChange={(e) => set("platform")(e.target.value)}
            placeholder="Instagram / Telegram / YouTube"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">{uz.bloggers.budget}</label>
          <Input type="number" step="any" min="0" value={f.budgetAllocated} onChange={(e) => set("budgetAllocated")(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-muted-foreground">{uz.bloggers.spent}</label>
          <Input type="number" step="any" min="0" value={f.spent} onChange={(e) => set("spent")(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-xs text-muted-foreground">{uz.bloggers.note}</label>
          <Input value={f.note} onChange={(e) => set("note")(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-rose-500">{error}</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>{uz.bloggers.save}</Button>
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          {uz.bloggers.cancel}
        </Button>
      </div>
    </form>
  );
}

export default function BloggerPanel({
  bookId,
  bloggers,
}: {
  bookId: string;
  bloggers: BloggerRow[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [delPending, startDel] = useTransition();
  const refresh = () => router.refresh();

  const totalBudget = bloggers.reduce((a, b) => a + b.budgetAllocated, 0);
  const totalSpent = bloggers.reduce((a, b) => a + b.spent, 0);

  function onDelete(id: string) {
    if (!window.confirm(uz.bloggers.confirmDelete)) return;
    startDel(async () => {
      await deleteBloggerAction(id);
      refresh();
    });
  }

  const payload = (f: FormState) => ({
    name: f.name,
    platform: f.platform || undefined,
    budgetAllocated: f.budgetAllocated === "" ? 0 : Number(f.budgetAllocated),
    spent: f.spent === "" ? 0 : Number(f.spent),
    note: f.note || undefined,
  });

  return (
    <Card className="w-full pt-6 pb-6 gap-6 ring-0 border rounded-2xl">
      <CardHeader className="px-6 flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="leading-normal">{uz.bloggers.title}</CardTitle>
          <CardDescription>
            {uz.bloggers.totalBudget}: {fmtUZS(totalBudget)} · {uz.bloggers.totalSpent}: {fmtUZS(totalSpent)}
          </CardDescription>
        </div>
        {!adding && (
          <Button
            className="gap-1.5 shrink-0"
            onClick={() => {
              setEditId(null);
              setAdding(true);
            }}
          >
            <Plus className="size-4" />
            {uz.bloggers.add}
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-6 flex flex-col gap-4">
        {adding && (
          <BloggerForm
            initial={empty}
            onCancel={() => setAdding(false)}
            onSubmit={async (f) => {
              const res = await createBloggerAction({ bookId, ...payload(f) });
              if (res.ok) refresh();
              return res;
            }}
          />
        )}

        {bloggers.length === 0 && !adding ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {uz.bloggers.empty}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-2xl">
              <TableHeader>
                <TableRow className="hover:bg-transparent!">
                  <TableHead className="p-2">{uz.bloggers.name}</TableHead>
                  <TableHead className="p-2">{uz.bloggers.platform}</TableHead>
                  <TableHead className="p-2 text-right">{uz.bloggers.budget}</TableHead>
                  <TableHead className="p-2 text-right">{uz.bloggers.spent}</TableHead>
                  <TableHead className="p-2 text-right">{uz.bloggers.remaining}</TableHead>
                  <TableHead className="p-2 text-right">{uz.bloggers.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {bloggers.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="p-2 text-sm font-medium text-card-foreground">
                      {b.name}
                      {b.note && (
                        <span className="block text-xs text-muted-foreground">{b.note}</span>
                      )}
                    </TableCell>
                    <TableCell className="p-2 text-sm text-muted-foreground">
                      {b.platform ?? uz.common.dash}
                    </TableCell>
                    <TableCell className="p-2 text-right text-sm">{fmtUZS(b.budgetAllocated)}</TableCell>
                    <TableCell className="p-2 text-right text-sm">{fmtUZS(b.spent)}</TableCell>
                    <TableCell className="p-2 text-right text-sm">
                      <span className={b.remaining < 0 ? "text-rose-500" : "text-teal-600"}>
                        {fmtUZS(b.remaining)}
                      </span>
                    </TableCell>
                    <TableCell className="p-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" aria-label={uz.bloggers.edit}
                          onClick={() => { setAdding(false); setEditId((c) => (c === b.id ? null : b.id)); }}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8 text-rose-500 hover:text-rose-600"
                          aria-label={uz.bloggers.delete} disabled={delPending} onClick={() => onDelete(b.id)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {editId &&
          (() => {
            const b = bloggers.find((x) => x.id === editId);
            if (!b) return null;
            return (
              <BloggerForm
                initial={toForm(b)}
                onCancel={() => setEditId(null)}
                onSubmit={async (f) => {
                  const res = await updateBloggerAction(b.id, payload(f));
                  if (res.ok) refresh();
                  return res;
                }}
              />
            );
          })()}
      </CardContent>
    </Card>
  );
}
