import type { ReactNode } from "react";
import { Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { uz, fmtNumber, fmtUZS } from "@/lib/i18n/uz";
import { pct, dec } from "@/lib/metrics";
import type { DashboardKpis } from "@/lib/dal/dashboard";
import type { CampaignRow } from "@/lib/dal/campaigns";

/** USD figure, or "—". Kept out of i18n on purpose — this is a formatted value. */
const usd = (v: number | null): string =>
  v == null ? "—" : `$${dec(v)}`;

/** Burn% → badge + progress-bar colour. Full literal class strings so the
 *  Tailwind JIT emits them (<80 teal, 80–100 amber, >100 red). */
function burnStyle(burn: number | null): { badge: string; bar: string } {
  if (burn == null)
    return {
      badge: "bg-muted text-muted-foreground",
      bar: "**:data-[slot=progress-indicator]:bg-muted-foreground",
    };
  if (burn > 100)
    return {
      badge: "bg-rose-500/10 text-rose-500",
      bar: "**:data-[slot=progress-indicator]:bg-rose-500",
    };
  if (burn >= 80)
    return {
      badge: "bg-orange-400/10 text-orange-600",
      bar: "**:data-[slot=progress-indicator]:bg-orange-400",
    };
  return {
    badge: "bg-teal-400/10 text-teal-600",
    bar: "**:data-[slot=progress-indicator]:bg-teal-400",
  };
}

/** Pacing text colour: >1.05 over (red), <0.9 under (amber), else on-track. */
function pacingTextColor(p: number | null): string {
  if (p == null) return "text-muted-foreground";
  if (p > 1.05) return "text-rose-500";
  if (p < 0.9) return "text-orange-600";
  return "text-teal-600";
}

function Tile({
  label,
  value,
  sub,
  note,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  note?: ReactNode;
}) {
  return (
    <Card className="ring-0 border rounded-2xl py-5 gap-0">
      <CardContent className="px-5 flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
          <span>{label}</span>
          {note}
        </div>
        <p className="text-2xl font-medium text-card-foreground">{value}</p>
        {sub != null && (
          <p className="text-xs font-normal text-muted-foreground">{sub}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardView({
  kpi,
  campaigns,
}: {
  kpi: DashboardKpis;
  campaigns: CampaignRow[];
}) {
  // Spend-weighted average pacing across campaigns that report it.
  let paceNum = 0;
  let paceDen = 0;
  for (const c of campaigns) {
    if (c.pacing != null && c.spendUSD > 0) {
      paceNum += c.pacing * c.spendUSD;
      paceDen += c.spendUSD;
    }
  }
  const pacingAvg = paceDen ? paceNum / paceDen : null;

  const burn = burnStyle(kpi.burnPct);
  const burnValue =
    kpi.burnPct == null ? 0 : Math.min(100, Math.max(0, kpi.burnPct));

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium text-card-foreground">
          {uz.nav.dashboard}
        </h1>
        <p className="text-sm text-muted-foreground">{uz.dashboard.subtitle}</p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <Tile
          label={uz.metrics.spend}
          value={fmtUZS(kpi.spendUZS)}
          sub={usd(kpi.spendUSD)}
        />
        <Tile label={uz.metrics.budget} value={fmtUZS(kpi.budgetUZS)} />
        <Tile label={uz.metrics.remaining} value={fmtUZS(kpi.remainingUZS)} />
        <Tile
          label={uz.metrics.reach}
          value={fmtNumber(kpi.reach)}
          note={
            !kpi.reachIsDeduped ? (
              <span
                title={uz.dashboard.reachApproxNote}
                className="inline-flex items-center gap-0.5 text-orange-600"
              >
                <Info size={12} />({uz.dashboard.reachApprox})
              </span>
            ) : undefined
          }
        />
        <Tile
          label={uz.metrics.impressions}
          value={fmtNumber(kpi.impressions)}
        />
        <Tile label={uz.metrics.ctr} value={pct(kpi.metrics.ctr)} />
        <Tile label={uz.metrics.cpm} value={usd(kpi.metrics.cpm)} />
        <Tile label={uz.metrics.leads} value={fmtNumber(kpi.leads)} />
        <Tile
          label={uz.metrics.pacing}
          value={
            <span className={cn(pacingTextColor(pacingAvg))}>
              {dec(pacingAvg)}
            </span>
          }
          sub={uz.dashboard.pacingAvgNote}
        />
        <Tile
          label={uz.metrics.directRoas}
          value={dec(kpi.metrics.directRoas)}
          note={
            <span
              title={uz.dashboard.roasNote}
              className="inline-flex items-center text-muted-foreground"
            >
              <Info size={12} />
            </span>
          }
        />
      </div>

      {/* Budget burn */}
      <Card className="ring-0 border rounded-2xl py-6">
        <CardContent className="px-6 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-card-foreground">
                {uz.dashboard.burnTitle}
              </span>
              <span className="text-xs text-muted-foreground">
                {fmtUZS(kpi.totalCostUZS)} / {fmtUZS(kpi.budgetUZS)}
              </span>
            </div>
            <Badge className={cn("font-normal", burn.badge)}>
              {kpi.burnPct == null ? "—" : `${kpi.burnPct.toFixed(0)}%`}
            </Badge>
          </div>
          <Progress
            value={burnValue}
            className={cn(
              "w-full **:data-[slot=progress-track]:h-2",
              burn.bar,
            )}
          />
        </CardContent>
      </Card>

      {/* Campaigns table */}
      <Card className="w-full pb-0 pt-6 gap-6 ring-0 border rounded-2xl">
        <CardHeader className="px-6">
          <CardTitle className="leading-normal">
            {uz.dashboard.campaignsTitle}
          </CardTitle>
          <CardDescription>{uz.campaigns.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-1 py-12 px-6 text-center">
              <p className="text-sm font-medium text-card-foreground">
                {uz.campaigns.empty}
              </p>
              <p className="text-xs text-muted-foreground">
                {uz.campaigns.emptyBody}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-2xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.campaigns.colCampaign}
                    </TableHead>
                    <TableHead className="p-2">{uz.campaigns.colSpend}</TableHead>
                    <TableHead className="p-2">{uz.campaigns.colCtr}</TableHead>
                    <TableHead className="p-2">{uz.campaigns.colCpm}</TableHead>
                    <TableHead className="p-2">
                      {uz.campaigns.colFrequency}
                    </TableHead>
                    <TableHead className="p-3 pe-6 text-right">
                      {uz.campaigns.colPacing}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap p-3 ps-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-card-foreground">
                            {c.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {c.bookTitle ?? uz.campaigns.noBook}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm">
                        {fmtUZS(c.spendUZS)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm">
                        {pct(c.metrics.ctr)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm">
                        {usd(c.metrics.cpm)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm">
                        {dec(c.metrics.frequency)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "whitespace-nowrap p-3 pe-6 text-right text-sm font-medium",
                          pacingTextColor(c.pacing),
                        )}
                      >
                        {dec(c.pacing)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
