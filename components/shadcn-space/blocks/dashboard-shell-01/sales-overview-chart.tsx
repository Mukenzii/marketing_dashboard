"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { uz, fmtUZS } from "@/lib/i18n/uz";

export type TrendPoint = {
  label: string;
  spend: number; // UZS
  impressions: number;
  reach: number;
};

const chartConfig = {
  spend: { label: uz.metrics.spend, color: "var(--color-blue-500)" },
  impressions: { label: uz.metrics.impressions, color: "var(--color-sky-400)" },
  reach: { label: uz.metrics.reach, color: "rgba(56, 189, 248, 0.5)" },
} satisfies ChartConfig;

export default function SalesOverviewChart({
  data,
  totalUZS,
}: {
  data: TrendPoint[];
  totalUZS: number;
}) {
  const legend = [
    { id: 1, title: uz.metrics.spend, color: "bg-blue-500" },
    { id: 2, title: uz.metrics.impressions, color: "bg-sky-400" },
    { id: 3, title: uz.metrics.reach, color: "bg-sky-400/50" },
  ];

  return (
    <Card className="w-full py-6 gap-6">
      <CardHeader className="flex sm:flex-row flex-col justify-between sm:items-center items-start gap-3 px-6">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-medium">
            {uz.overview.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <h3 className="text-3xl font-medium text-card-foreground">
              {fmtUZS(totalUZS)}
            </h3>
            <Badge
              className={cn("bg-teal-400/10 text-muted-foreground shadow-none")}
            >
              {uz.metrics.daily}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {uz.overview.last10}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {legend.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
              <p className="text-sm text-muted-foreground">{item.title}</p>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-6">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="rgba(144, 164, 174, 0.3)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              fontSize={12}
              tickFormatter={(v) => `${Math.round(v / 1_000_000)}M`}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar
              dataKey="spend"
              fill="var(--color-spend)"
              radius={[6, 6, 0, 0]}
              barSize={22}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
