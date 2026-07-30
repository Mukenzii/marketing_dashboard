"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import {
  Ticket,
  Clock,
  CircleCheck,
  TrendingUp,
  Search,
  Plus,
  LucideIcon,
} from "lucide-react";

type Stat = {
  label: string;
  value: string;
  icon: LucideIcon;
  tile: string;
};

const stats: Stat[] = [
  {
    label: "Open tickets",
    value: "128",
    icon: Ticket,
    tile: "bg-blue-500/10 text-blue-600",
  },
  {
    label: "Awaiting reply",
    value: "34",
    icon: Clock,
    tile: "bg-orange-400/10 text-orange-600",
  },
  {
    label: "Resolved today",
    value: "76",
    icon: CircleCheck,
    tile: "bg-teal-400/10 text-teal-600",
  },
  {
    label: "Avg. first response",
    value: "1h 12m",
    icon: TrendingUp,
    tile: "bg-indigo-400/10 text-indigo-600",
  },
];

const tabs = ["All", "Open", "Pending", "Resolved"] as const;
type Tab = (typeof tabs)[number];

type Priority = "Urgent" | "High" | "Medium" | "Low";
type Status = "Open" | "Pending" | "Resolved";

type TicketRow = {
  id: string;
  title: string;
  excerpt: string;
  priority: Priority;
  status: Status;
  assignee: string;
  initials: string;
  avatarClass: string;
  time: string;
};

const priorityBar: Record<Priority, string> = {
  Urgent: "bg-rose-500",
  High: "bg-orange-500",
  Medium: "bg-blue-500",
  Low: "bg-slate-400",
};

const priorityBadge: Record<Priority, string> = {
  Urgent: "bg-rose-500/10 text-rose-500",
  High: "bg-orange-400/10 text-orange-600",
  Medium: "bg-blue-500/10 text-blue-600",
  Low: "bg-muted text-muted-foreground",
};

const statusStyles: Record<Status, { chip: string; dot: string }> = {
  Open: { chip: "bg-blue-500/10 text-blue-600", dot: "bg-blue-500" },
  Pending: { chip: "bg-orange-400/10 text-orange-600", dot: "bg-orange-500" },
  Resolved: { chip: "bg-teal-400/10 text-teal-600", dot: "bg-teal-500" },
};

const tickets: TicketRow[] = [
  {
    id: "#T-2841",
    title: "Export to CSV drops the last column",
    excerpt:
      "Reproduced on Chrome 128 with 12+ visible columns and a pinned action column.",
    priority: "Urgent",
    status: "Open",
    assignee: "Marcus Reid",
    initials: "MR",
    avatarClass: "bg-blue-500/15 text-blue-600",
    time: "8m ago",
  },
  {
    id: "#T-2840",
    title: "SSO login loops on Safari",
    excerpt:
      "Redirect returns to the login screen after a successful callback. Affects 3 tenants.",
    priority: "High",
    status: "Pending",
    assignee: "Hana Sato",
    initials: "HS",
    avatarClass: "bg-orange-400/15 text-orange-600",
    time: "42m ago",
  },
  {
    id: "#T-2839",
    title: "Invoice totals rounding by 1 cent",
    excerpt:
      "Line items sum correctly but the footer total rounds down on 3 of 40 invoices.",
    priority: "Medium",
    status: "Open",
    assignee: "Elias Lund",
    initials: "EL",
    avatarClass: "bg-teal-400/15 text-teal-600",
    time: "2h ago",
  },
  {
    id: "#T-2838",
    title: "Request: dark mode for reports",
    excerpt:
      "Customer prints reports at night and wants the viewer to follow the system theme.",
    priority: "Low",
    status: "Pending",
    assignee: "Priya Nair",
    initials: "PN",
    avatarClass: "bg-pink-400/15 text-pink-600",
    time: "5h ago",
  },
  {
    id: "#T-2837",
    title: "Webhook retries not backing off",
    excerpt:
      "Failed deliveries retry every 30s instead of exponentially. Fix deployed to staging.",
    priority: "High",
    status: "Resolved",
    assignee: "Marcus Reid",
    initials: "MR",
    avatarClass: "bg-blue-500/15 text-blue-600",
    time: "Yesterday",
  },
  {
    id: "#T-2836",
    title: "Seat count not updating after removal",
    excerpt:
      "Billing page caches the seat total for up to an hour after a member is removed.",
    priority: "Medium",
    status: "Resolved",
    assignee: "Anna Kowalski",
    initials: "AK",
    avatarClass: "bg-indigo-400/15 text-indigo-600",
    time: "2 days ago",
  },
];

const TicketsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const visibleTickets =
    activeTab === "All"
      ? tickets
      : tickets.filter((t) => t.status === activeTab);

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="ring-0 border p-4">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  stat.tile,
                )}
              >
                <stat.icon size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-semibold text-foreground">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Tickets list */}
      <Card className="ring-0 border p-0">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex w-fit gap-1 rounded-lg bg-muted p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <InputGroup className="h-9 w-full sm:w-64">
              <InputGroupAddon>
                <Search size={16} />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search tickets…" />
            </InputGroup>
            <Button className="gap-1.5 bg-blue-500 text-white hover:bg-blue-500/90 h-9 whitespace-nowrap">
              <Plus size={16} />
              <span>New Ticket</span>
            </Button>
          </div>
        </div>

        <div className="divide-y border-t">
          {visibleTickets.map((ticket) => {
            const status = statusStyles[ticket.status];
            return (
              <div
                key={ticket.id}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:gap-4"
              >
                <span
                  className={cn(
                    "hidden h-9 w-1 shrink-0 rounded-full md:block",
                    priorityBar[ticket.priority],
                  )}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground">
                      {ticket.title}
                    </h3>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {ticket.id}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {ticket.excerpt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:shrink-0">
                  <span
                    className={cn(
                      "rounded-md px-2 py-0.5 text-xs font-medium",
                      priorityBadge[ticket.priority],
                    )}
                  >
                    {ticket.priority}
                  </span>

                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                      status.chip,
                    )}
                  >
                    <span className={cn("size-1.5 rounded-full", status.dot)} />
                    {ticket.status}
                  </span>

                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <AvatarFallback
                        className={cn(
                          "text-xs font-semibold",
                          ticket.avatarClass,
                        )}
                      >
                        {ticket.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">
                      {ticket.assignee}
                    </span>
                  </div>

                  <span className="ml-auto text-xs text-muted-foreground md:ml-0">
                    {ticket.time}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default TicketsPage;
