import { ImageIcon, ChevronsUpDown, Info, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { uz, fmtNumber } from "@/lib/i18n/uz";
import { pct, dec } from "@/lib/metrics";
import type { CreativeRow } from "@/lib/dal/campaigns";

function SortHead({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <TableHead className={cn("p-2", className)}>
      <span className="inline-flex items-center gap-1 select-none">
        {label}
        <ChevronsUpDown className="size-3 text-muted-foreground/60" />
      </span>
    </TableHead>
  );
}

function Legend() {
  return (
    <Card className="w-full border-blue-500/20 bg-blue-500/5">
      <CardContent className="flex items-start gap-3 py-4">
        <Info className="size-4 shrink-0 mt-0.5 text-blue-600" />
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium text-foreground">
            {uz.creatives.legendTitle}
          </p>
          <p className="text-muted-foreground">{uz.creatives.legendHook}</p>
          <p className="text-muted-foreground">{uz.creatives.legendHold}</p>
          <p className="text-orange-600">{uz.creatives.legendPending}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <Megaphone className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {uz.creatives.empty}
        </p>
        <p className="text-xs text-muted-foreground">
          {uz.creatives.emptyBody}
        </p>
      </CardContent>
    </Card>
  );
}

export default function CreativesTable({
  creatives,
}: {
  creatives: CreativeRow[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-medium text-foreground">
          {uz.nav.creatives}
        </h1>
        <p className="text-xs text-muted-foreground">
          {uz.creatives.subtitle}
        </p>
      </div>

      <Legend />

      {creatives.length === 0 ? (
        <EmptyState />
      ) : (
        <Card className="w-full pb-0 pt-6 gap-6">
          <CardHeader className="px-6">
            <CardTitle className="leading-normal">
              {uz.nav.creatives}
            </CardTitle>
            <CardDescription>{uz.creatives.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table className="min-w-4xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.creatives.colCreative}
                    </TableHead>
                    <SortHead label={uz.metrics.hookRate} />
                    <SortHead label={uz.metrics.holdRate} />
                    <SortHead label={uz.metrics.ctr} />
                    <SortHead label={uz.metrics.cpm} />
                    <SortHead label={uz.metrics.spend} />
                    <SortHead
                      label={uz.metrics.frequency}
                      className="p-3 pe-6"
                    />
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border dark:divide-darkborder">
                  {creatives.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap p-3 ps-6">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                            <ImageIcon className="size-4 text-muted-foreground" />
                          </div>
                          <div className="max-w-64">
                            <h6 className="text-sm font-medium text-foreground truncate">
                              {c.name}
                            </h6>
                            <p className="text-xs text-muted-foreground truncate">
                              {c.campaignName ?? "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-foreground">
                          {pct(c.hookRate)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-foreground">
                          {pct(c.holdRate)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-foreground">
                          {pct(c.ctr)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-foreground">
                          {c.cpm == null ? "—" : `$${dec(c.cpm)}`}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="text-sm text-foreground">
                          ${fmtNumber(Math.round(c.spendUSD))}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-3 pe-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-foreground">
                            {dec(c.frequency)}
                          </span>
                          {c.fatigue && (
                            <Badge className="bg-rose-500/10 text-rose-500 font-normal">
                              {uz.creatives.fatigue}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
