import { Info } from "lucide-react";

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
import { uz, fmtNumber } from "@/lib/i18n/uz";
import { pct, dec } from "@/lib/metrics";
import type { CampaignRow } from "@/lib/dal/campaigns";

export default function ResultsView({
  campaigns,
}: {
  campaigns: CampaignRow[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">
          {uz.nav.results}
        </h1>
        <p className="text-sm text-muted-foreground">{uz.results.subtitle}</p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3">
        <Info size={16} className="mt-0.5 shrink-0 text-blue-600" />
        <p className="text-sm text-muted-foreground">{uz.results.note}</p>
      </div>

      <Card className="w-full py-6 gap-5">
        <CardHeader className="px-6 flex flex-col gap-1">
          <CardTitle className="text-lg font-medium text-foreground">
            {uz.nav.results}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {uz.results.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {campaigns.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                {uz.results.empty}
              </p>
              <p className="text-sm text-muted-foreground">
                {uz.results.emptyBody}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-5xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.results.colCampaign}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.results.colReach}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.results.colImpressions}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.results.colCtr}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.results.colHook}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.results.colHold}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.results.colLeads}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.results.colCpl}
                    </TableHead>
                    <TableHead className="p-2 text-right">
                      {uz.results.colVisitRate}
                    </TableHead>
                    <TableHead className="p-3 pe-6 text-right">
                      {uz.results.colLeadRate}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="whitespace-nowrap p-3 ps-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-foreground max-w-64 truncate">
                            {c.name}
                          </span>
                          {c.bookTitle && (
                            <span className="text-xs text-muted-foreground max-w-64 truncate">
                              {c.bookTitle}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {fmtNumber(c.reach)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {fmtNumber(c.impressions)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {pct(c.metrics.ctr)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {pct(c.metrics.hookRate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {pct(c.metrics.holdRate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {fmtNumber(c.leads)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {c.metrics.cpl == null ? "—" : `$${dec(c.metrics.cpl)}`}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right text-sm text-foreground">
                        {pct(c.metrics.visitRate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-3 pe-6 text-right text-sm text-foreground">
                        {pct(c.metrics.leadRate)}
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
