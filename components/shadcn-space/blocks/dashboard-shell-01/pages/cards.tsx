"use client";

import { Area, AreaChart } from "recharts";
import { Check, TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const sparkData = [18, 24, 21, 30, 27, 36, 33, 44, 41, 52].map((v, i) => ({
  i,
  v,
}));

const sparkConfig = {
  v: { label: "Value", color: "#3b82f6" },
} satisfies ChartConfig;

const pricingFeatures = [
  "Unlimited dashboards",
  "Faceted table filters",
  "Role-based access",
  "Priority support",
];

type Task = {
  id: number;
  label: string;
  done?: boolean;
  chip: string;
  chipClass: string;
};

const tasks: Task[] = [
  {
    id: 1,
    label: "Review table selection PR",
    done: true,
    chip: "Today",
    chipClass: "bg-muted text-muted-foreground",
  },
  {
    id: 2,
    label: "Density audit on Orders",
    chip: "2h",
    chipClass: "bg-rose-500/10 text-rose-500",
  },
  {
    id: 3,
    label: "Write migration notes",
    chip: "Tomorrow",
    chipClass: "bg-orange-400/10 text-orange-600",
  },
  {
    id: 4,
    label: "Sync tokens with engineering",
    chip: "Fri",
    chipClass: "bg-blue-500/10 text-blue-600",
  },
];

export default function CardsPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
      {/* 1) Metric card */}
      <Card className="gap-4">
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Monthly Recurring
            </span>
            <span className="inline-flex items-center rounded-md bg-teal-400/10 px-2 py-0.5 text-xs font-medium text-teal-600">
              +11.4%
            </span>
          </div>
          <div className="text-3xl font-medium text-foreground">$128,540</div>
          <p className="text-sm text-muted-foreground">
            Compared to $115,400 last month
          </p>
          <ChartContainer config={sparkConfig} className="h-14 w-full">
            <AreaChart
              data={sparkData}
              margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="metricSpark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                dataKey="v"
                type="natural"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#metricSpark)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* 2) Profile card */}
      <Card className="overflow-hidden p-0 gap-0">
        <div className="h-24 bg-gradient-to-r from-blue-500/15 to-indigo-500/15" />
        <div className="flex flex-col items-center px-6 pb-6">
          <Avatar className="size-[76px] -mt-10 ring-4 ring-background">
            <AvatarFallback className="bg-indigo-500 text-white text-lg font-medium">
              AK
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-3 text-lg font-medium text-foreground">
            Anna Kowalski
          </h3>
          <p className="text-sm text-muted-foreground">
            Principal Product Designer
          </p>
          <div className="mt-4 grid w-full grid-cols-3 border-t pt-4 text-center">
            <div>
              <div className="text-base font-medium text-foreground">184</div>
              <div className="text-xs text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="text-base font-medium text-foreground">12.4k</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div>
              <div className="text-base font-medium text-foreground">386</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3) Pricing card - dark */}
      <Card className="bg-foreground text-background gap-4">
        <CardContent className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-background/15 px-3 py-1 text-xs font-medium">
            MOST POPULAR
          </span>
          <div>
            <div className="text-base font-medium">Team</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-4xl font-medium">$29</span>
              <span className="text-sm text-background/60">
                / seat / month
              </span>
            </div>
          </div>
          <ul className="flex flex-col gap-3">
            {pricingFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-background/15">
                  <Check className="size-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Button className="w-full bg-background text-foreground hover:bg-background/90">
            Choose Team
          </Button>
        </CardContent>
      </Card>

      {/* 4) Article card */}
      <Card className="overflow-hidden p-0 gap-0">
        <div className="h-40 bg-muted" />
        <CardContent className="flex flex-col gap-3 p-6">
          <span className="text-xs text-muted-foreground">
            PRODUCT · 4 min read
          </span>
          <h3 className="text-lg font-medium text-foreground">
            Everything new in the July release
          </h3>
          <p className="text-sm text-muted-foreground">
            Faceted filters, a new density scale and 14 refreshed pages.
          </p>
          <Button variant="outline" className="w-fit">
            Read more
          </Button>
        </CardContent>
      </Card>

      {/* 5) Today's Tasks card */}
      <Card className="gap-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium text-foreground">
            Today&apos;s Tasks
          </CardTitle>
          <a
            href="#"
            className="text-sm font-medium text-blue-500 hover:underline"
          >
            View all
          </a>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <Checkbox defaultChecked={t.done} />
                  <span
                    className={cn(
                      "text-sm text-foreground",
                      t.done && "text-muted-foreground line-through",
                    )}
                  >
                    {t.label}
                  </span>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                    t.chipClass,
                  )}
                >
                  {t.chip}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 6) Callout card */}
      <Card className="bg-blue-500/5 border-blue-500/20 gap-4">
        <CardContent className="flex flex-col gap-4">
          <div className="flex size-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <TrendingUp className="size-5" />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            You&apos;re close to your API limit
          </h3>
          <p className="text-sm text-muted-foreground">
            91% of this month&apos;s quota is used. Upgrade to Scale for
            unmetered requests and priority routing.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="bg-blue-500 text-white hover:bg-blue-500/90">
              Upgrade plan
            </Button>
            <Button variant="outline">See usage</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
