"use client";

import { Label, Pie, PieChart } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { uz, fmtUZS } from "@/lib/i18n/uz";

const chartConfig = {
  value: { label: uz.metrics.spend },
  ads: { label: uz.metrics.ads, color: "var(--color-blue-500)" },
  blogger: { label: uz.metrics.blogger, color: "var(--color-sky-400)" },
  production: { label: uz.metrics.production, color: "rgba(56,189,248,0.5)" },
} satisfies ChartConfig;

export default function EarningReportChart({
  ads,
  blogger,
  production,
}: {
  ads: number;
  blogger: number;
  production: number;
}) {
  const total = ads + blogger + production;
  const chartData = [
    { key: "ads", value: ads, fill: "var(--color-blue-500)" },
    { key: "blogger", value: blogger, fill: "var(--color-sky-400)" },
    { key: "production", value: production, fill: "rgba(56,189,248,0.5)" },
  ];
  const rows = [
    { label: uz.metrics.ads, amount: ads, bar: "bg-blue-500" },
    { label: uz.metrics.blogger, amount: blogger, bar: "bg-sky-400" },
    { label: uz.metrics.production, amount: production, bar: "bg-sky-400/50" },
  ];
  const shortUZS = (n: number) => `${(n / 1_000_000).toFixed(1)}M`;

  return (
    <Card className="h-full w-full py-6 gap-6">
      <CardHeader className="px-6">
        <CardTitle>
          <h4 className="text-lg font-semibold">{uz.spendSplit.title}</h4>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-between gap-2 flex-1 px-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="key"
              innerRadius={65}
              strokeWidth={50}
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
                          {uz.spendSplit.total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 15}
                          className="fill-foreground text-lg font-medium"
                        >
                          {shortUZS(total)}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-col gap-3">
          {rows.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className={cn(item.bar, "w-1 h-4 rounded-full")} />
                <h6 className="text-sm font-medium leading-tight">
                  {item.label}
                </h6>
              </div>
              <div className="flex items-center gap-1">
                <h6 className="text-sm font-medium">{fmtUZS(item.amount)}</h6>
                <Badge className="bg-teal-400/10 text-muted-foreground shadow-none">
                  {total ? `${Math.round((item.amount / total) * 100)}%` : "—"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
