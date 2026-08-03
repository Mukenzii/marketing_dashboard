"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchIcon, EllipsisVertical } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { uz } from "@/lib/i18n/uz";

export type ProductRow = {
  id: string;
  name: string;
  sub: string;
  amount: string;
  person: string;
  personSub: string;
  progress: number; // 0..100
  progressColor: string; // tailwind class for the indicator bg
  initials: string;
  tint: string; // avatar tint classes
};

const initialsOf = (t: string) =>
  t.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export { initialsOf };

const TopProductTable = ({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: ProductRow[];
}) => {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? rows.filter(
        (r) =>
          (r.name ?? "").toLowerCase().includes(needle) ||
          (r.sub ?? "").toLowerCase().includes(needle),
      )
    : rows;
  return (
    <Card className="w-full h-full pb-0 pt-6 gap-6">
      <CardHeader className="sm:flex items-center justify-between px-6">
        <div>
          <CardTitle className="leading-normal">{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <InputGroup className="h-9 rounded-md w-fit">
          <InputGroupInput
            placeholder={uz.header.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon size={18} />
          </InputGroupAddon>
        </InputGroup>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="min-w-2xl">
            <TableHeader>
              <TableRow className="hover:bg-transparent!">
                <TableHead className="p-3 ps-6">#</TableHead>
                <TableHead className="p-2">{uz.overviewTable.name}</TableHead>
                <TableHead className="p-2">{uz.metrics.spend}</TableHead>
                <TableHead className="p-2">{uz.overviewTable.detail}</TableHead>
                <TableHead className="p-2">{uz.overviewTable.progress}</TableHead>
                <TableHead className="p-3 pe-6 flex justify-end">
                  {uz.overviewTable.action}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    —
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap p-3 ps-6 text-sm text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold",
                            item.tint,
                          )}
                        >
                          {item.initials}
                        </div>
                        <div>
                          <h6 className="text-sm font-medium">{item.name}</h6>
                          <p className="text-xs text-muted-foreground">
                            {item.sub}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm text-foreground">{item.amount}</p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div>
                        <h6 className="text-sm font-normal">{item.person}</h6>
                        <p className="text-xs text-muted-foreground">
                          {item.personSub}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Progress
                        value={item.progress}
                        className={cn(
                          "w-full h-1.5 [&>div]:h-1.5",
                          item.progressColor,
                        )}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap p-3 pe-6">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <span className="flex justify-center items-center rounded-full p-2 hover:bg-muted cursor-pointer">
                              <EllipsisVertical width={16} height={16} />
                            </span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              render={
                                <Link href="/dashboard/kampaniyalar" />
                              }
                            >
                              {uz.overviewTable.viewCampaigns}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopProductTable;
