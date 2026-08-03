"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Check } from "lucide-react";
import { syncMetaAction } from "@/lib/actions/meta";
import type { SyncRunRow } from "@/lib/dal/admin";
import { uz, fmtNumber } from "@/lib/i18n/uz";

function fmtStamp(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function MetaSyncCard({ last }: { last: SyncRunRow | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const statusBadge = () => {
    if (!last) return null;
    const map: Record<string, { cls: string; label: string }> = {
      success: { cls: "bg-teal-400/10 text-teal-600", label: uz.settings.metaStatusSuccess },
      failed: { cls: "bg-rose-500/10 text-rose-500", label: uz.settings.metaStatusFailed },
      running: { cls: "bg-orange-400/10 text-orange-600", label: uz.settings.metaStatusRunning },
    };
    const s = map[last.status] ?? map.running;
    return <Badge className={s.cls}>{s.label}</Badge>;
  };

  function onSync() {
    setError(null);
    setDone(false);
    start(async () => {
      const res = await syncMetaAction();
      if (!res.ok) {
        setError(res.error ?? uz.settings.metaStatusFailed);
        return;
      }
      setDone(true);
      router.refresh();
    });
  }

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {uz.settings.metaTitle}
            </span>
            {statusBadge()}
          </div>
          <p className="text-sm text-muted-foreground">
            {uz.settings.metaSubtitle}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {uz.settings.metaLastSync}:{" "}
            {last ? (
              <>
                {fmtStamp(last.finishedAt ?? last.startedAt)} · {fmtNumber(last.rowsUpserted)}{" "}
                {uz.settings.metaRows}
                {last.dateFrom && last.dateTo
                  ? ` · ${last.dateFrom} → ${last.dateTo}`
                  : ""}
              </>
            ) : (
              uz.settings.metaNever
            )}
          </p>
          {last?.status === "failed" && last.error && (
            <p className="mt-1 max-w-xl text-xs text-rose-500">{last.error}</p>
          )}
          {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
          {done && (
            <p className="mt-1 flex items-center gap-1 text-xs text-teal-600">
              <Check className="size-3.5" />
              {uz.settings.metaDone}
            </p>
          )}
        </div>
        <Button onClick={onSync} disabled={pending} className="gap-2 shrink-0">
          <RefreshCw className={"size-4" + (pending ? " animate-spin" : "")} />
          {pending ? uz.settings.metaSyncing : uz.settings.metaSyncNow}
        </Button>
      </CardContent>
    </Card>
  );
}
