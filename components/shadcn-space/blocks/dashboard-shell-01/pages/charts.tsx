"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const sessionValues = [38, 52, 46, 68, 61, 80, 72, 96, 88, 108, 101, 124];
const signupValues = [64, 92, 78, 120, 104, 146, 132, 168, 152, 188, 170, 205];

const areaData = months.map((month, i) => ({ month, v: sessionValues[i] }));
const barData = months.map((month, i) => ({ month, v: signupValues[i] }));

const areaConfig = {
  v: { label: "Sessions", color: "#2563eb" },
} satisfies ChartConfig;

const barConfig = {
  v: { label: "Signups", color: "#2563eb" },
} satisfies ChartConfig;

// Donut
const donutData = [
  { name: "Website", value: 18356, fill: "#2563eb" },
  { name: "Marketplace", value: 4590, fill: "#93c5fd" },
  { name: "Affiliate", value: 4385, fill: "#dbeafe" },
];

const donutConfig = {
  value: { label: "Revenue" },
  Website: { label: "Website", color: "#2563eb" },
  Marketplace: { label: "Marketplace", color: "#93c5fd" },
  Affiliate: { label: "Affiliate", color: "#dbeafe" },
} satisfies ChartConfig;

const donutLegend = [
  { name: "Website", value: "$18,356", color: "#2563eb" },
  { name: "Marketplace", value: "$4590", color: "#93c5fd" },
  { name: "Affiliate", value: "$4385", color: "#dbeafe" },
];

const gaugeStats = [
  { label: "Completed", value: "2,481" },
  { label: "In progress", value: "318" },
  { label: "Blocked", value: "64" },
];

const trafficSources = [
  { label: "Organic search", pct: 46, color: "#2563eb" },
  { label: "Direct", pct: 24, color: "#60a5fa" },
  { label: "Referral", pct: 16, color: "#93c5fd" },
  { label: "Social", pct: 9, color: "#c7dcfd" },
  { label: "Email", pct: 5, color: "#e2edfe" },
];

type Spark = {
  label: string;
  value: string;
  delta: string;
  deltaClass: string;
  color: string;
  type: "area" | "line";
  data: number[];
};

const sparks: Spark[] = [
  {
    label: "Active users",
    value: "18.4k",
    delta: "+6.2%",
    deltaClass: "bg-teal-400/10 text-teal-600",
    color: "#2563eb",
    type: "area",
    data: [10, 14, 12, 18, 16, 22, 26, 24, 31],
  },
  {
    label: "Retention",
    value: "82%",
    delta: "+1.1%",
    deltaClass: "bg-teal-400/10 text-teal-600",
    color: "#059669",
    type: "area",
    data: [22, 24, 23, 26, 28, 27, 30, 32, 34],
  },
  {
    label: "Churn",
    value: "2.1%",
    delta: "-0.4%",
    deltaClass: "bg-teal-400/10 text-teal-600",
    color: "#dc2626",
    type: "line",
    data: [28, 26, 27, 23, 24, 20, 19, 17, 15],
  },
  {
    label: "Avg. session",
    value: "6m 42s",
    delta: "+18s",
    deltaClass: "bg-teal-400/10 text-teal-600",
    color: "#7c3aed",
    type: "area",
    data: [12, 16, 15, 20, 24, 22, 28, 30, 35],
  },
];

function Sparkline({ spark }: { spark: Spark }) {
  const data = spark.data.map((v, i) => ({ i, v }));
  const config = { v: { label: spark.label, color: spark.color } } satisfies ChartConfig;
  const gradId = `spark-${spark.label.replace(/[^a-z]/gi, "")}`;
  return (
    <ChartContainer config={config} className="h-11 w-full">
      {spark.type === "area" ? (
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={spark.color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={spark.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            dataKey="v"
            type="natural"
            stroke={spark.color}
            strokeWidth={2}
            fill={`url(#${gradId})`}
          />
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Line
            dataKey="v"
            type="natural"
            stroke={spark.color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      )}
    </ChartContainer>
  );
}

function RadialGauge({ value }: { value: number }) {
  const size = 160;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 100);
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-medium text-foreground">{value}%</span>
        <span className="text-xs text-muted-foreground">On track</span>
      </div>
    </div>
  );
}

export default function ChartsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Area + Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">
              Area
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sessions, last 12 months
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaConfig} className="h-[220px] w-full">
              <AreaChart
                accessibilityLayer
                data={areaData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="rgba(144, 164, 174, 0.3)"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Area
                  dataKey="v"
                  type="natural"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#areaFill)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">
              Bar
            </CardTitle>
            <p className="text-sm text-muted-foreground">Signups by month</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="h-[220px] w-full">
              <BarChart
                accessibilityLayer
                data={barData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="rgba(144, 164, 174, 0.3)"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === barData.length - 1 ? "#2563eb" : "#bfdbfe"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Donut + Gauges + Traffic */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Donut */}
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">
              Donut
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ChartContainer
              config={donutConfig}
              className="mx-auto aspect-square max-h-[220px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={4}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 10}
                              className="fill-muted-foreground text-sm"
                            >
                              Total
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 14}
                              className="fill-foreground text-xl font-medium"
                            >
                              $27,850
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex flex-col gap-3 border-t pt-4">
              {donutLegend.map((l) => (
                <div
                  key={l.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: l.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {l.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {l.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gauges */}
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">
              Gauges
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-center py-2">
              <RadialGauge value={78} />
            </div>
            <div className="grid grid-cols-3 border-t pt-4 text-center">
              {gaugeStats.map((s) => (
                <div key={s.label}>
                  <div className="text-base font-medium text-foreground">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="gap-4">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {trafficSources.map((t) => (
              <div key={t.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{t.label}</span>
                  <span className="text-muted-foreground">{t.pct}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${t.pct}%`, backgroundColor: t.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Sparklines */}
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">
            Sparklines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {sparks.map((s) => (
              <div key={s.label} className="flex flex-col gap-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-medium text-foreground">
                    {s.value}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                      s.deltaClass,
                    )}
                  >
                    {s.delta}
                  </span>
                </div>
                <Sparkline spark={s} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
