"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { ThresholdRow } from "@/lib/dal/admin";
import {
  createThresholdAction,
  updateThresholdAction,
  deleteThresholdAction,
} from "@/lib/actions/thresholds";
import { fmtNumber, uz } from "@/lib/i18n/uz";

/** Render a warn/alert range from below/above bounds. */
function rangeLabel(below: number | null, above: number | null): string {
  if (below != null && above != null) {
    return `${fmtNumber(below)} – ${fmtNumber(above)}`;
  }
  if (above != null) return `> ${fmtNumber(above)}`;
  if (below != null) return `< ${fmtNumber(below)}`;
  return uz.common.dash;
}

type FormState = {
  metricKey: string;
  objective: string;
  brand: "" | "falaq_nashr" | "falaq_kids";
  warnBelow: string;
  warnAbove: string;
  alertBelow: string;
  alertAbove: string;
};

const emptyForm: FormState = {
  metricKey: "",
  objective: "",
  brand: "",
  warnBelow: "",
  warnAbove: "",
  alertBelow: "",
  alertAbove: "",
};

const toForm = (t: ThresholdRow): FormState => ({
  metricKey: t.metricKey,
  objective: t.objective ?? "",
  brand: (t.brand as FormState["brand"]) ?? "",
  warnBelow: t.warnBelow?.toString() ?? "",
  warnAbove: t.warnAbove?.toString() ?? "",
  alertBelow: t.alertBelow?.toString() ?? "",
  alertAbove: t.alertAbove?.toString() ?? "",
});

const num = (s: string): number | null => {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

function ThresholdForm({
  title,
  initial,
  onSubmit,
  onCancel,
}: {
  title: string;
  initial: FormState;
  onSubmit: (payload: {
    metricKey: string;
    objective?: string;
    brand: "falaq_nashr" | "falaq_kids" | null;
    warnBelow: number | null;
    warnAbove: number | null;
    alertBelow: number | null;
    alertAbove: number | null;
  }) => Promise<{ ok: boolean; error?: string }>;
  onCancel: () => void;
}) {
  const [f, setF] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const set = (k: keyof FormState) => (v: string) =>
    setF((prev) => ({ ...prev, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await onSubmit({
        metricKey: f.metricKey,
        objective: f.objective.trim() || undefined,
        brand: f.brand === "" ? null : f.brand,
        warnBelow: num(f.warnBelow),
        warnAbove: num(f.warnAbove),
        alertBelow: num(f.alertBelow),
        alertAbove: num(f.alertAbove),
      });
      if (!res.ok) {
        setError(res.error ?? "Xatolik");
        return;
      }
      onCancel();
    });
  }

  const numField = (label: string, k: keyof FormState) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input
        type="number"
        step="any"
        inputMode="decimal"
        value={f[k]}
        onChange={(e) => set(k)(e.target.value)}
      />
    </div>
  );

  return (
    <Card className="rounded-2xl border-dashed">
      <CardContent className="p-5">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <p className="text-sm font-medium text-foreground">{title}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                {uz.settings.fMetric}
              </label>
              <Input
                list="metric-keys"
                value={f.metricKey}
                onChange={(e) => set("metricKey")(e.target.value)}
                placeholder={uz.settings.fMetricHint}
                required
              />
              <datalist id="metric-keys">
                <option value="frequency" />
                <option value="cpm" />
                <option value="cpc" />
                <option value="ctr" />
                <option value="roas" />
                <option value="pacing" />
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                {uz.settings.fObjective}
              </label>
              <Input
                value={f.objective}
                onChange={(e) => set("objective")(e.target.value)}
                placeholder={uz.settings.fObjectivePlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-muted-foreground">
                {uz.settings.fBrand}
              </label>
              <select
                value={f.brand}
                onChange={(e) =>
                  set("brand")(e.target.value as FormState["brand"])
                }
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">{uz.settings.allBrands}</option>
                <option value="falaq_nashr">{uz.brands.falaq_nashr}</option>
                <option value="falaq_kids">{uz.brands.falaq_kids}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="col-span-2 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-orange-600">
                {uz.settings.fWarn}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {numField(uz.settings.fBelow, "warnBelow")}
                {numField(uz.settings.fAbove, "warnAbove")}
              </div>
            </div>
            <div className="col-span-2 flex flex-col gap-1.5">
              <span className="text-xs font-medium text-rose-500">
                {uz.settings.fAlert}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {numField(uz.settings.fBelow, "alertBelow")}
                {numField(uz.settings.fAbove, "alertAbove")}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={pending}>
              {uz.settings.save}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={onCancel}
            >
              {uz.settings.cancel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsView({
  thresholds,
}: {
  thresholds: ThresholdRow[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deletePending, startDelete] = useTransition();

  const refresh = () => router.refresh();

  function onDelete(id: string) {
    if (!window.confirm(uz.settings.confirmDelete)) return;
    startDelete(async () => {
      await deleteThresholdAction(id);
      refresh();
    });
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {uz.nav.settings}
          </h1>
          <p className="text-sm text-muted-foreground">{uz.settings.subtitle}</p>
        </div>
        <Button
          className="gap-1.5"
          onClick={() => {
            setEditId(null);
            setAdding((v) => !v);
          }}
        >
          <Plus className="size-4" />
          {uz.settings.addThreshold}
        </Button>
      </div>

      {adding && (
        <ThresholdForm
          title={uz.settings.formAddTitle}
          initial={emptyForm}
          onCancel={() => setAdding(false)}
          onSubmit={async (payload) => {
            const res = await createThresholdAction(payload);
            if (res.ok) refresh();
            return res;
          }}
        />
      )}

      <Card className="w-full pt-6 pb-0 gap-6">
        <CardHeader className="px-6">
          <CardTitle>{uz.settings.thresholdsTitle}</CardTitle>
          <CardDescription>{uz.settings.thresholdsSubtitle}</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {/* Legend */}
          <div className="mb-4 flex flex-wrap items-center gap-4 px-6">
            <span className="text-xs font-medium text-muted-foreground">
              {uz.settings.legendTitle}:
            </span>
            <Badge className="bg-teal-400/10 text-teal-600">
              {uz.settings.legendOk}
            </Badge>
            <Badge className="bg-orange-400/10 text-orange-600">
              {uz.settings.legendWarn}
            </Badge>
            <Badge className="bg-rose-500/10 text-rose-500">
              {uz.settings.legendAlert}
            </Badge>
          </div>

          {thresholds.length === 0 ? (
            <div className="px-6 pb-6 text-center">
              <p className="text-sm font-medium text-foreground">
                {uz.settings.empty}
              </p>
              <p className="text-sm text-muted-foreground">
                {uz.settings.emptyBody}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-2xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.settings.colMetric}
                    </TableHead>
                    <TableHead className="p-2">
                      {uz.settings.colObjective}
                    </TableHead>
                    <TableHead className="p-2">{uz.settings.colBrand}</TableHead>
                    <TableHead className="p-2">{uz.settings.colWarn}</TableHead>
                    <TableHead className="p-2">{uz.settings.colAlert}</TableHead>
                    <TableHead className="p-3 pe-6 text-right">
                      {uz.settings.colActions}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {thresholds.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="whitespace-nowrap p-3 ps-6 text-sm font-medium text-foreground">
                        {t.metricKey}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm text-muted-foreground">
                        {t.objective ?? uz.common.all}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm text-muted-foreground">
                        {t.brand
                          ? (uz.brands[t.brand as keyof typeof uz.brands] ??
                            t.brand)
                          : uz.common.all}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2">
                        <Badge className="bg-orange-400/10 text-orange-600">
                          {rangeLabel(t.warnBelow, t.warnAbove)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2">
                        <Badge className="bg-rose-500/10 text-rose-500">
                          {rangeLabel(t.alertBelow, t.alertAbove)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-3 pe-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={uz.settings.edit}
                            onClick={() => {
                              setAdding(false);
                              setEditId((cur) => (cur === t.id ? null : t.id));
                            }}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-rose-500 hover:text-rose-600"
                            aria-label={uz.settings.delete}
                            disabled={deletePending}
                            onClick={() => onDelete(t.id)}
                          >
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
        </CardContent>
      </Card>

      {editId &&
        (() => {
          const t = thresholds.find((x) => x.id === editId);
          if (!t) return null;
          return (
            <ThresholdForm
              title={uz.settings.formEditTitle}
              initial={toForm(t)}
              onCancel={() => setEditId(null)}
              onSubmit={async (payload) => {
                const res = await updateThresholdAction(t.id, payload);
                if (res.ok) refresh();
                return res;
              }}
            />
          );
        })()}
    </>
  );
}
