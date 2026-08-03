"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { uz, fmtNumber } from "@/lib/i18n/uz";
import { pct, dec, type BadgeStatus } from "@/lib/metrics";
import type { BookMetrics, DayMetric } from "@/lib/dal/book-metrics";

const usd = (v: number): string =>
  "$" +
  (v >= 1000
    ? fmtNumber(Math.round(v))
    : v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

const STATUS: Record<BadgeStatus, { cls: string; dot: string; label: string }> = {
  ok: { cls: "text-teal-600", dot: "bg-teal-500", label: uz.dailyMetrics.ok },
  warn: { cls: "text-orange-600", dot: "bg-orange-500", label: uz.dailyMetrics.warn },
  alert: { cls: "text-rose-500", dot: "bg-rose-500", label: uz.dailyMetrics.alert },
};

const BAR: Record<BadgeStatus, string> = {
  ok: "before:bg-teal-500",
  warn: "before:bg-orange-500",
  alert: "before:bg-rose-500",
};

function MetricCard({
  label,
  value,
  status,
  date,
}: {
  label: string;
  value: string;
  status?: BadgeStatus;
  date?: string;
}) {
  const s = status ? STATUS[status] : null;
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl before:absolute before:left-0 before:top-0 before:h-full before:w-1",
        status ? BAR[status] : "before:bg-border",
      )}
    >
      <CardContent className="flex flex-col gap-3 p-5 pl-6">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        <div className="flex items-center justify-between">
          {s ? (
            <span className={cn("flex items-center gap-1.5 text-xs font-medium", s.cls)}>
              <span className={cn("size-1.5 rounded-full", s.dot)} />
              {s.label}
            </span>
          ) : (
            <span />
          )}
          {date && <span className="text-[11px] text-muted-foreground">{date}</span>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function BookDailyMetrics({ data }: { data: BookMetrics }) {
  const [activeKey, setActiveKey] = useState<string>("overall");

  if (!data.hasData) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-foreground">
            {uz.dailyMetrics.title}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {uz.dailyMetrics.noData}
          </p>
        </CardContent>
      </Card>
    );
  }

  const day: DayMetric = data.days.find((d) => d.key === activeKey) ?? data.days[0];
  const dateLabel = day.isOverall ? "" : day.label;

  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {uz.dailyMetrics.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {uz.dailyMetrics.subtitle}
            </p>
          </div>
          {data.delivery && (
            <Badge className="bg-teal-400/10 text-teal-600">{data.delivery}</Badge>
          )}
        </div>

        {/* Day tabs */}
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {data.days.map((d) => (
            <button
              key={d.key}
              onClick={() => setActiveKey(d.key)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                d.key === activeKey
                  ? "bg-blue-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              {d.isOverall ? uz.dailyMetrics.overall : d.label}
            </button>
          ))}
        </div>

        {/* Main metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <MetricCard
            label={uz.dailyMetrics.hook}
            value={pct(day.hookRate, 1)}
            status={day.status.hookRate}
            date={dateLabel}
          />
          <MetricCard
            label={uz.dailyMetrics.hold}
            value={pct(day.holdRate, 1)}
            status={day.status.holdRate}
            date={dateLabel}
          />
          <MetricCard
            label={uz.dailyMetrics.spend}
            value={usd(day.spendUSD)}
            date={dateLabel}
          />
          <MetricCard
            label={uz.dailyMetrics.ctr}
            value={pct(day.ctr, 2)}
            status={day.status.ctr}
            date={dateLabel}
          />
          <MetricCard
            label={uz.dailyMetrics.cpm}
            value={day.cpm == null ? "—" : usd(day.cpm)}
            status={day.status.cpm}
            date={dateLabel}
          />
        </div>

        {/* Extra metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <MetricCard
            label={uz.dailyMetrics.delivery}
            value={data.delivery ?? "—"}
            date={dateLabel}
          />
          <MetricCard
            label={uz.dailyMetrics.reach}
            value={fmtNumber(day.reach)}
            date={dateLabel}
          />
          <MetricCard
            label={uz.dailyMetrics.impressions}
            value={fmtNumber(day.impressions)}
            date={dateLabel}
          />
          <MetricCard
            label={uz.dailyMetrics.frequency}
            value={dec(day.frequency, 2)}
            status={day.status.frequency}
            date={dateLabel}
          />
        </div>
      </CardContent>
    </Card>
  );
}
