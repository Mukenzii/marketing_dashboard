import { Megaphone, TrendingDown, Users, Target } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { uz, fmtUZS, fmtNumber } from "@/lib/i18n/uz";
import { pct, dec } from "@/lib/metrics";
import type { CampaignRow } from "@/lib/dal/campaigns";

const INFO = "bg-blue-500/10 text-blue-600";
const NEUTRAL = "bg-muted text-muted-foreground";

function pacingBadge(p: number | null): { cls: string; label: string } {
  if (p == null) return { cls: NEUTRAL, label: "—" };
  if (p < 0.8)
    return { cls: "bg-orange-400/10 text-orange-600", label: `${dec(p)} · ${uz.campaigns.paceSlow}` };
  if (p > 1.2)
    return { cls: "bg-rose-500/10 text-rose-500", label: `${dec(p)} · ${uz.campaigns.paceFast}` };
  return { cls: "bg-teal-400/10 text-teal-600", label: dec(p) };
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tile,
}: {
  label: string;
  value: string;
  icon: typeof Megaphone;
  tile: string;
}) {
  return (
    <Card className="gap-4 py-5">
      <CardContent className="px-5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-medium text-foreground">{value}</h3>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            tile,
          )}
        >
          <Icon size={18} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CampaignsView({
  campaigns,
}: {
  campaigns: CampaignRow[];
}) {
  const totalSpend = campaigns.reduce((s, c) => s + c.spendUZS, 0);
  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leads, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {uz.nav.campaigns}
        </h1>
        <p className="text-sm text-muted-foreground">{uz.campaigns.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={uz.campaigns.kpiCampaigns}
          value={fmtNumber(campaigns.length)}
          icon={Megaphone}
          tile="bg-blue-500/10 text-blue-600"
        />
        <KpiCard
          label={uz.campaigns.kpiSpend}
          value={fmtUZS(totalSpend)}
          icon={TrendingDown}
          tile="bg-teal-400/10 text-teal-600"
        />
        <KpiCard
          label={uz.campaigns.kpiReach}
          value={fmtNumber(totalReach)}
          icon={Users}
          tile="bg-indigo-500/10 text-indigo-600"
        />
        <KpiCard
          label={uz.campaigns.kpiLeads}
          value={fmtNumber(totalLeads)}
          icon={Target}
          tile="bg-orange-400/10 text-orange-600"
        />
      </div>

      <Card className="w-full py-6 gap-5">
        <CardHeader className="px-6 flex flex-col gap-1">
          <CardTitle className="text-lg font-medium text-foreground">
            {uz.nav.campaigns}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {uz.campaigns.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {campaigns.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                {uz.campaigns.empty}
              </p>
              <p className="text-sm text-muted-foreground">
                {uz.campaigns.emptyBody}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-5xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.campaigns.colCampaign}
                    </TableHead>
                    <TableHead className="p-2">{uz.campaigns.colBook}</TableHead>
                    <TableHead className="p-2">
                      {uz.campaigns.colObjective}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.campaigns.colSpend}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.campaigns.colReach}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.campaigns.colCtr}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.campaigns.colCpm}
                    </TableHead>
                    <TableHead className="p-2">
                      {uz.campaigns.colFrequency}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.campaigns.colLeads}
                    </TableHead>
                    <TableHead className="p-3 pe-6">
                      {uz.campaigns.colPacing}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {campaigns.map((c) => {
                    const pace = pacingBadge(c.pacing);
                    const freq = c.metrics.frequency;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="whitespace-nowrap p-3 ps-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-foreground max-w-64 truncate">
                              {c.name}
                            </span>
                            {c.funnelStage && (
                              <span
                                className={cn(
                                  "w-fit rounded-md px-2 py-0.5 text-xs font-medium",
                                  INFO,
                                )}
                              >
                                {c.funnelStage}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground max-w-56 truncate">
                          {c.bookTitle ?? uz.campaigns.noBook}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                          {c.objective ?? "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {fmtUZS(c.spendUZS)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ${dec(c.spendUSD)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                          {fmtNumber(c.reach)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                          {pct(c.metrics.ctr)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                          {c.metrics.cpm == null ? "—" : `$${dec(c.metrics.cpm)}`}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <span
                            className={cn(
                              "w-fit rounded-md px-2 py-0.5 text-xs font-medium",
                              freq == null
                                ? NEUTRAL
                                : freq > 4
                                  ? "bg-rose-500/10 text-rose-500"
                                  : NEUTRAL,
                            )}
                          >
                            {dec(freq)}
                          </span>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                          {fmtNumber(c.leads)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap p-3 pe-6">
                          <span
                            className={cn(
                              "w-fit rounded-md px-2 py-0.5 text-xs font-medium",
                              pace.cls,
                            )}
                          >
                            {pace.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
