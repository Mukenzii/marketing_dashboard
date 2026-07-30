"use client";

import {
  Users,
  CircleCheck,
  TrendingUp,
  ChartPie,
  Plus,
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Area, AreaChart, XAxis } from "recharts";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

/* ------------------------------- stat cards ------------------------------- */

type Stat = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  tile: string;
  icon: LucideIcon;
  stroke: string;
  spark: number[];
};

const stats: Stat[] = [
  {
    label: "Total Leads",
    value: "4,281",
    delta: "+12%",
    positive: true,
    tile: "bg-blue-500/10 text-blue-600",
    icon: Users,
    stroke: "#3b82f6",
    spark: [12, 18, 15, 24, 20, 28, 34, 31, 40],
  },
  {
    label: "Deals Won",
    value: "318",
    delta: "+8%",
    positive: true,
    tile: "bg-teal-400/10 text-teal-600",
    icon: CircleCheck,
    stroke: "#14b8a6",
    spark: [8, 12, 11, 16, 21, 19, 26, 30, 33],
  },
  {
    label: "Revenue",
    value: "$1.28M",
    delta: "+24%",
    positive: true,
    tile: "bg-indigo-500/10 text-indigo-600",
    icon: TrendingUp,
    stroke: "#6366f1",
    spark: [20, 24, 22, 30, 28, 36, 33, 44, 52],
  },
  {
    label: "Conversion",
    value: "7.4%",
    delta: "-1.2%",
    positive: false,
    tile: "bg-orange-400/10 text-orange-600",
    icon: ChartPie,
    stroke: "#f97316",
    spark: [30, 28, 32, 27, 29, 24, 26, 22, 20],
  },
];

const sparkConfig = {
  v: { label: "Value" },
} satisfies ChartConfig;

function chipClasses(positive: boolean) {
  return positive
    ? "bg-teal-400/10 text-teal-600 dark:text-teal-400"
    : "bg-rose-500/10 text-rose-500";
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  const data = stat.spark.map((v, i) => ({ i, v }));
  const gradId = `spark-${stat.label.replace(/\s+/g, "-")}`;
  return (
    <Card className="gap-4 py-5">
      <CardContent className="px-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{stat.label}</p>
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              stat.tile,
            )}
          >
            <Icon size={18} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-medium text-foreground">{stat.value}</h3>
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-medium",
              chipClasses(stat.positive),
            )}
          >
            {stat.delta}
          </span>
        </div>
        <ChartContainer config={sparkConfig} className="h-10 w-full">
          <AreaChart
            data={data}
            margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stat.stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={stat.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              dataKey="v"
              type="monotone"
              stroke={stat.stroke}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/* ------------------------------ revenue chart ----------------------------- */

const revenueData = [
  { month: "Aug", v: 42 },
  { month: "Sep", v: 58 },
  { month: "Oct", v: 51 },
  { month: "Nov", v: 74 },
  { month: "Dec", v: 66 },
  { month: "Jan", v: 88 },
  { month: "Feb", v: 79 },
  { month: "Mar", v: 104 },
  { month: "Apr", v: 96 },
  { month: "May", v: 118 },
  { month: "Jun", v: 109 },
  { month: "Jul", v: 134 },
];

const revenueConfig = {
  v: { label: "Closed-won", color: "var(--color-blue-500)" },
} satisfies ChartConfig;

function RevenueGrowth() {
  const toggles = ["Monthly", "Quarterly", "Yearly"];
  return (
    <Card className="w-full py-6 gap-5">
      <CardHeader className="px-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-medium text-foreground">
            Revenue Growth
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Closed-won value, last 12 months
          </CardDescription>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {toggles.map((t) => (
            <button
              key={t}
              type="button"
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                t === "Monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-6 flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <h3 className="text-3xl font-medium text-foreground">$1.28M</h3>
          <span className="rounded-md bg-teal-400/10 px-2 py-0.5 text-xs font-medium text-teal-600 dark:text-teal-400">
            +24%
          </span>
          <span className="text-sm text-muted-foreground">
            vs previous period
          </span>
        </div>
        <ChartContainer config={revenueConfig} className="h-[210px] w-full">
          <AreaChart
            data={revenueData}
            margin={{ top: 5, right: 8, left: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
            />
            <Area
              dataKey="v"
              type="monotone"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#revenue-fill)"
              dot={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/* -------------------------------- pipeline -------------------------------- */

type Stage = { stage: string; value: string; pct: number; indicator: string };

const pipeline: Stage[] = [
  {
    stage: "Qualification",
    value: "$412k",
    pct: 92,
    indicator: "**:data-[slot=progress-indicator]:bg-blue-600",
  },
  {
    stage: "Discovery",
    value: "$318k",
    pct: 71,
    indicator: "**:data-[slot=progress-indicator]:bg-blue-500",
  },
  {
    stage: "Proposal",
    value: "$246k",
    pct: 55,
    indicator: "**:data-[slot=progress-indicator]:bg-blue-400",
  },
  {
    stage: "Negotiation",
    value: "$164k",
    pct: 37,
    indicator: "**:data-[slot=progress-indicator]:bg-blue-300",
  },
  {
    stage: "Closed Won",
    value: "$140k",
    pct: 31,
    indicator: "**:data-[slot=progress-indicator]:bg-emerald-500",
  },
];

function Pipeline() {
  return (
    <Card className="w-full py-6 gap-5">
      <CardHeader className="px-6 flex flex-col gap-1">
        <CardTitle className="text-lg font-medium text-foreground">
          Pipeline
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          438 open opportunities
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 flex flex-col gap-5">
        {pipeline.map((s) => (
          <div key={s.stage} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{s.stage}</span>
              <span className="text-sm font-semibold text-foreground">
                {s.value}
              </span>
            </div>
            <Progress
              value={s.pct}
              className={cn("h-1.5", s.indicator)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* ------------------------------ recent leads ------------------------------ */

type Lead = {
  name: string;
  email: string;
  initials: string;
  avatar: string;
  company: string;
  value: string;
  stage: string;
  stageClass: string;
};

const leads: Lead[] = [
  {
    name: "Marcus Reid",
    email: "marcus@northbay.io",
    initials: "MR",
    avatar: "bg-blue-500/15 text-blue-600",
    company: "Northbay",
    value: "$42,000",
    stage: "Proposal",
    stageClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    name: "Priya Nair",
    email: "priya@lumen.co",
    initials: "PN",
    avatar: "bg-pink-500/15 text-pink-600",
    company: "Lumen Co",
    value: "$28,500",
    stage: "Discovery",
    stageClass: "bg-pink-500/10 text-pink-600",
  },
  {
    name: "Tomás Herrera",
    email: "tomas@vela.mx",
    initials: "TH",
    avatar: "bg-orange-400/15 text-orange-600",
    company: "Vela",
    value: "$61,200",
    stage: "Negotiation",
    stageClass: "bg-orange-400/10 text-orange-600 dark:text-orange-500",
  },
  {
    name: "Grace Okonkwo",
    email: "grace@arcbase.dev",
    initials: "GO",
    avatar: "bg-teal-400/15 text-teal-600",
    company: "Arcbase",
    value: "$18,900",
    stage: "Won",
    stageClass: "bg-teal-400/10 text-teal-600 dark:text-teal-400",
  },
  {
    name: "Elias Lund",
    email: "elias@fjord.se",
    initials: "EL",
    avatar: "bg-indigo-500/15 text-indigo-600",
    company: "Fjord AB",
    value: "$34,750",
    stage: "Qualified",
    stageClass: "bg-indigo-500/10 text-indigo-600",
  },
  {
    name: "Hana Sato",
    email: "hana@kiro.jp",
    initials: "HS",
    avatar: "bg-teal-400/15 text-teal-600",
    company: "Kiro",
    value: "$52,400",
    stage: "Proposal",
    stageClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
];

function RecentLeads() {
  return (
    <Card className="w-full h-full py-6 gap-5">
      <CardHeader className="px-6 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium text-foreground">
          Recent Leads
        </CardTitle>
        <Button className="h-9 gap-1.5 bg-blue-500 text-white hover:bg-blue-500/90">
          <Plus size={16} />
          Add Lead
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table className="min-w-2xl">
            <TableHeader>
              <TableRow className="hover:bg-transparent!">
                <TableHead className="p-3 ps-6">Lead</TableHead>
                <TableHead className="p-2">Company</TableHead>
                <TableHead className="p-2">Value</TableHead>
                <TableHead className="p-2">Stage</TableHead>
                <TableHead className="p-3 pe-6 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {leads.map((lead) => (
                <TableRow key={lead.email}>
                  <TableCell className="whitespace-nowrap p-3 ps-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-semibold",
                            lead.avatar,
                          )}
                        >
                          {lead.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {lead.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lead.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {lead.company}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm font-semibold text-foreground">
                    {lead.value}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        lead.stageClass,
                      )}
                    >
                      {lead.stage}
                    </span>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* -------------------------------- activity -------------------------------- */

type Activity = {
  title: string;
  body: string;
  time: string;
  dot: string;
};

const activity: Activity[] = [
  {
    title: "Deal moved to Negotiation",
    body: "Vela — $61,200 · owner Tomás Herrera",
    time: "12 minutes ago",
    dot: "bg-blue-500",
  },
  {
    title: "Proposal sent",
    body: "Northbay received the Q3 platform proposal.",
    time: "1 hour ago",
    dot: "bg-violet-500",
  },
  {
    title: "Call logged",
    body: "32-minute discovery call with Lumen Co.",
    time: "3 hours ago",
    dot: "bg-orange-500",
  },
  {
    title: "Deal won",
    body: "Arcbase signed the annual contract.",
    time: "Yesterday",
    dot: "bg-emerald-500",
  },
  {
    title: "New lead assigned",
    body: "Kiro assigned to Anna Kowalski.",
    time: "2 days ago",
    dot: "bg-slate-400",
  },
];

function ActivityCard() {
  return (
    <Card className="w-full h-full py-6 gap-5">
      <CardHeader className="px-6">
        <CardTitle className="text-lg font-medium text-foreground">
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="flex flex-col">
          {activity.map((item, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "mt-1 size-2.5 shrink-0 rounded-full",
                    item.dot,
                  )}
                />
                {idx < activity.length - 1 && (
                  <span className="w-px flex-1 bg-border" />
                )}
              </div>
              <div className={cn("flex flex-col gap-0.5", idx < activity.length - 1 && "pb-6")}>
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="text-sm text-muted-foreground">{item.body}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------------------------- page ---------------------------------- */

export default function CrmPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_372px]">
        <RevenueGrowth />
        <Pipeline />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_372px]">
        <RecentLeads />
        <ActivityCard />
      </div>
    </div>
  );
}
