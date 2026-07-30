import { Users, Wallet, TrendingDown } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import type { ManagerSummary } from "@/lib/dal/team";

const NEUTRAL = "bg-muted text-muted-foreground";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + second).toUpperCase() || "—";
}

function burnBadgeClass(burn: number | null): string {
  if (burn == null) return NEUTRAL;
  if (burn > 100) return "bg-rose-500/10 text-rose-500";
  if (burn >= 80) return "bg-orange-400/10 text-orange-600";
  return "bg-teal-400/10 text-teal-600";
}

function burnBarClass(burn: number | null): string {
  if (burn == null) return "**:data-[slot=progress-indicator]:bg-muted-foreground";
  if (burn > 100) return "**:data-[slot=progress-indicator]:bg-rose-500";
  if (burn >= 80) return "**:data-[slot=progress-indicator]:bg-orange-400";
  return "**:data-[slot=progress-indicator]:bg-teal-400";
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tile,
}: {
  label: string;
  value: string;
  icon: typeof Users;
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

export default function TeamView({
  managers,
}: {
  managers: ManagerSummary[];
}) {
  const rows = [...managers].sort((a, b) => b.spendUZS - a.spendUZS);
  const totalBudget = rows.reduce((s, m) => s + m.budgetUZS, 0);
  const totalSpend = rows.reduce((s, m) => s + m.spendUZS, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {uz.nav.team}
        </h1>
        <p className="text-sm text-muted-foreground">{uz.team.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <KpiCard
          label={uz.team.kpiManagers}
          value={fmtNumber(rows.length)}
          icon={Users}
          tile="bg-blue-500/10 text-blue-600"
        />
        <KpiCard
          label={uz.team.kpiBudget}
          value={fmtUZS(totalBudget)}
          icon={Wallet}
          tile="bg-indigo-500/10 text-indigo-600"
        />
        <KpiCard
          label={uz.team.kpiSpend}
          value={fmtUZS(totalSpend)}
          icon={TrendingDown}
          tile="bg-teal-400/10 text-teal-600"
        />
      </div>

      <Card className="w-full py-6 gap-5">
        <CardHeader className="px-6 flex flex-col gap-1">
          <CardTitle className="text-lg font-medium text-foreground">
            {uz.nav.team}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {uz.team.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {rows.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                {uz.team.empty}
              </p>
              <p className="text-sm text-muted-foreground">
                {uz.team.emptyBody}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-4xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.team.colManager}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.team.colBooks}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.team.colBudget}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.team.colSpend}
                    </TableHead>
                    <TableHead className="p-2">{uz.team.colBurn}</TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.team.colCpm}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.team.colCtr}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.team.colOpenTasks}
                    </TableHead>
                    <TableHead className="p-3 pe-6 text-right">
                      {uz.team.colOverdue}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {rows.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap p-3 ps-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarFallback className="bg-blue-500/15 text-xs font-semibold text-blue-600">
                              {initials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {m.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {m.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {fmtNumber(m.bookCount)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {fmtUZS(m.budgetUZS)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm font-medium text-foreground">
                        {fmtUZS(m.spendUZS)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 min-w-32">
                          <span
                            className={cn(
                              "w-fit rounded-md px-2 py-0.5 text-xs font-medium",
                              burnBadgeClass(m.burnPct),
                            )}
                          >
                            {m.burnPct == null ? "—" : `${dec(m.burnPct, 0)}%`}
                          </span>
                          <Progress
                            value={
                              m.burnPct == null
                                ? 0
                                : Math.min(m.burnPct, 100)
                            }
                            className={cn("h-1.5", burnBarClass(m.burnPct))}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {m.cpm == null ? "—" : `$${dec(m.cpm)}`}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {pct(m.ctr)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {fmtNumber(m.openTasks)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-3 pe-6 text-right">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            m.overdueTasks > 0
                              ? "text-rose-500"
                              : "text-muted-foreground",
                          )}
                        >
                          {fmtNumber(m.overdueTasks)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
