"use client";

import {
  SearchIcon,
  ChevronDown,
  Plus,
  EllipsisVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/* ------------------------------- basic table ------------------------------ */

type Member = {
  name: string;
  email: string;
  initials: string;
  avatar: string;
  role: string;
  team: string;
  joined: string;
};

const members: Member[] = [
  {
    name: "Anna Kowalski",
    email: "anna@acme.com",
    initials: "AK",
    avatar: "bg-indigo-500/15 text-indigo-600",
    role: "Principal Designer",
    team: "Design Systems",
    joined: "Mar 2021",
  },
  {
    name: "Marcus Reid",
    email: "marcus@acme.com",
    initials: "MR",
    avatar: "bg-blue-500/15 text-blue-600",
    role: "Engineer",
    team: "Platform",
    joined: "Jul 2022",
  },
  {
    name: "Priya Nair",
    email: "priya@acme.com",
    initials: "PN",
    avatar: "bg-pink-500/15 text-pink-600",
    role: "PM",
    team: "Growth",
    joined: "Jan 2023",
  },
  {
    name: "Elias Lund",
    email: "elias@acme.com",
    initials: "EL",
    avatar: "bg-teal-400/15 text-teal-600",
    role: "Data Analyst",
    team: "Insights",
    joined: "Sep 2023",
  },
  {
    name: "Hana Sato",
    email: "hana@acme.com",
    initials: "HS",
    avatar: "bg-orange-400/15 text-orange-600",
    role: "Support Lead",
    team: "Success",
    joined: "Feb 2024",
  },
];

function BasicTable() {
  return (
    <Card className="w-full py-6 gap-5">
      <CardHeader className="px-6 flex flex-col gap-1">
        <CardTitle className="text-lg font-medium text-foreground">
          Basic Table
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          A quiet table for reference data — no chrome, no controls.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="min-w-2xl">
            <TableHeader>
              <TableRow className="hover:bg-transparent!">
                <TableHead className="p-3 ps-6">Member</TableHead>
                <TableHead className="p-2">Role</TableHead>
                <TableHead className="p-2">Team</TableHead>
                <TableHead className="p-3 pe-6 text-right">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {members.map((m) => (
                <TableRow key={m.email}>
                  <TableCell className="whitespace-nowrap p-3 ps-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback
                          className={cn("text-xs font-semibold", m.avatar)}
                        >
                          {m.initials}
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
                  <TableCell className="whitespace-nowrap text-sm text-foreground">
                    {m.role}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {m.team}
                  </TableCell>
                  <TableCell className="whitespace-nowrap p-3 pe-6 text-right text-sm text-muted-foreground">
                    {m.joined}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* --------------------------------- orders --------------------------------- */

type Order = {
  id: string;
  customer: string;
  initials: string;
  avatar: string;
  status: "Paid" | "Pending" | "Refunded" | "Shipped";
  date: string;
  total: string;
  checked?: boolean;
};

const orders: Order[] = [
  {
    id: "#ORD-4471",
    customer: "Northbay Logistics",
    initials: "NL",
    avatar: "bg-blue-500/15 text-blue-600",
    status: "Paid",
    date: "24 Jul 2026",
    total: "$4,280",
    checked: true,
  },
  {
    id: "#ORD-4470",
    customer: "Lumen Co",
    initials: "LC",
    avatar: "bg-pink-500/15 text-pink-600",
    status: "Pending",
    date: "24 Jul 2026",
    total: "$1,150",
    checked: true,
  },
  {
    id: "#ORD-4469",
    customer: "Vela",
    initials: "VE",
    avatar: "bg-orange-400/15 text-orange-600",
    status: "Paid",
    date: "23 Jul 2026",
    total: "$9,640",
  },
  {
    id: "#ORD-4468",
    customer: "Arcbase",
    initials: "AB",
    avatar: "bg-teal-400/15 text-teal-600",
    status: "Refunded",
    date: "22 Jul 2026",
    total: "$820",
  },
  {
    id: "#ORD-4467",
    customer: "Fjord AB",
    initials: "FA",
    avatar: "bg-indigo-500/15 text-indigo-600",
    status: "Shipped",
    date: "21 Jul 2026",
    total: "$3,415",
  },
  {
    id: "#ORD-4466",
    customer: "Kiro",
    initials: "KI",
    avatar: "bg-teal-400/15 text-teal-600",
    status: "Paid",
    date: "21 Jul 2026",
    total: "$12,900",
  },
];

const statusStyles: Record<Order["status"], { chip: string; dot: string }> = {
  Paid: {
    chip: "bg-teal-400/10 text-teal-600 dark:text-teal-400",
    dot: "bg-teal-500",
  },
  Pending: {
    chip: "bg-orange-400/10 text-orange-600 dark:text-orange-500",
    dot: "bg-orange-500",
  },
  Refunded: {
    chip: "bg-rose-500/10 text-rose-500",
    dot: "bg-rose-500",
  },
  Shipped: {
    chip: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
};

const checkboxClass =
  "data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 dark:data-[state=checked]:border-blue-500 data-checked:bg-blue-500 data-checked:border-blue-500 cursor-pointer";

function OrdersTable() {
  return (
    <Card className="w-full py-6 gap-5">
      <CardHeader className="px-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-medium text-foreground">
            Orders
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            2 of 248 rows selected
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="h-9 w-full rounded-md sm:w-56">
            <InputGroupAddon>
              <SearchIcon size={16} />
            </InputGroupAddon>
            <InputGroupInput placeholder="Filter orders…" />
          </InputGroup>
          <Button variant="outline" className="h-9 gap-1.5">
            Status
            <ChevronDown size={16} />
          </Button>
          <Button variant="outline" className="h-9 gap-1.5">
            Columns
            <ChevronDown size={16} />
          </Button>
          <Button className="h-9 gap-1.5 bg-foreground text-background hover:bg-foreground/90">
            <Plus size={16} />
            New Order
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="min-w-3xl">
            <TableHeader>
              <TableRow className="hover:bg-transparent!">
                <TableHead className="p-3 ps-6 w-10">
                  <Checkbox className={checkboxClass} />
                </TableHead>
                <TableHead className="p-2">Order</TableHead>
                <TableHead className="p-2">Customer</TableHead>
                <TableHead className="p-2">Status</TableHead>
                <TableHead className="p-2">Date</TableHead>
                <TableHead className="p-2 text-right">Total</TableHead>
                <TableHead className="p-3 pe-6" />
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {orders.map((o) => {
                const status = statusStyles[o.status];
                return (
                  <TableRow
                    key={o.id}
                    className={cn(o.checked && "bg-muted/40")}
                  >
                    <TableCell className="whitespace-nowrap p-3 ps-6">
                      <Checkbox
                        defaultChecked={o.checked}
                        className={checkboxClass}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm font-medium text-foreground">
                      {o.id}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback
                            className={cn("text-xs font-semibold", o.avatar)}
                          >
                            {o.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-foreground">
                          {o.customer}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                          status.chip,
                        )}
                      >
                        <span
                          className={cn("size-1.5 rounded-full", status.dot)}
                        />
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {o.date}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm font-semibold text-foreground">
                      {o.total}
                    </TableCell>
                    <TableCell className="whitespace-nowrap p-3 pe-6">
                      <div className="flex justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <span className="flex items-center justify-center rounded-full p-2 hover:bg-muted cursor-pointer">
                              <EllipsisVertical size={16} />
                            </span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer">
                              <Eye />
                              <span>View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Pencil />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Trash2 />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-col gap-3 px-6 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Button variant="outline" className="h-8 gap-1.5 px-2.5">
              10
              <ChevronDown size={14} />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="size-8 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button className="size-8 p-0 bg-foreground text-background hover:bg-foreground/90">
              1
            </Button>
            <Button variant="outline" className="size-8 p-0">
              2
            </Button>
            <Button variant="outline" className="size-8 p-0">
              3
            </Button>
            <Button
              variant="outline"
              className="size-8 p-0"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function TablesPage() {
  return (
    <div className="flex flex-col gap-6">
      <BasicTable />
      <OrdersTable />
    </div>
  );
}
