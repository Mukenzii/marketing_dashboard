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
import type { AuditRow } from "@/lib/dal/admin";
import { fmtDate, uz } from "@/lib/i18n/uz";

function truncate(v: string, n = 12): string {
  return v.length > n ? `${v.slice(0, n)}…` : v;
}

export default function AuditView({ rows }: { rows: AuditRow[] }) {
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {uz.nav.audit}
        </h1>
        <p className="text-sm text-muted-foreground">{uz.audit.subtitle}</p>
      </div>

      <Card className="w-full pt-6 pb-0 gap-6">
        <CardHeader className="px-6">
          <CardTitle>{uz.nav.audit}</CardTitle>
          <CardDescription>{uz.audit.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {rows.length === 0 ? (
            <div className="mx-6 mb-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                {uz.audit.empty}
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                {uz.audit.emptyBody}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-2xl">
                <TableHeader>
                  <TableRow className="hover:bg-transparent!">
                    <TableHead className="p-3 ps-6">
                      {uz.audit.colDate}
                    </TableHead>
                    <TableHead className="p-2">{uz.audit.colUser}</TableHead>
                    <TableHead className="p-2">{uz.audit.colAction}</TableHead>
                    <TableHead className="p-3 pe-6">
                      {uz.audit.colEntity}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border">
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap p-3 ps-6 text-sm text-muted-foreground">
                        {fmtDate(r.createdAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm text-foreground">
                        {r.actorName ?? uz.common.dash}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-2 text-sm text-foreground">
                        {r.action}
                      </TableCell>
                      <TableCell className="whitespace-nowrap p-3 pe-6 text-sm text-muted-foreground">
                        {r.entityType}
                        {r.entityId ? ` · ${truncate(r.entityId)}` : ""}
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
