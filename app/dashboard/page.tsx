import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import StatisticsBlock from "@/components/shadcn-space/blocks/dashboard-shell-01/statistics";
import SalesOverviewChart from "@/components/shadcn-space/blocks/dashboard-shell-01/sales-overview-chart";
import EarningReportChart from "@/components/shadcn-space/blocks/dashboard-shell-01/earning-report-chart";
import TopProductTable, {
  type ProductRow,
} from "@/components/shadcn-space/blocks/dashboard-shell-01/top-product-table";
import SalesByCountryWidget from "@/components/shadcn-space/blocks/dashboard-shell-01/salesbycountrywidget";
import { CalendarDays, Megaphone } from "lucide-react";
import { getDashboardKpis } from "@/lib/dal/dashboard";
import {
  getSpendTrend,
  getSpendSplit,
  getSpendByBook,
} from "@/lib/dal/charts";
import { listCampaigns } from "@/lib/dal/campaigns";
import { requireDashboardAccess } from "@/lib/dal/context";
import { uz, fmtUZS, fmtNumber } from "@/lib/i18n/uz";

const TINTS = [
  "bg-blue-500/15 text-blue-600",
  "bg-violet-500/15 text-violet-600",
  "bg-teal-400/15 text-teal-600",
  "bg-orange-400/15 text-orange-600",
  "bg-rose-500/15 text-rose-500",
  "bg-sky-400/15 text-sky-600",
];

const initialsOf = (t: string) =>
  t.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

function paceColor(p: number | null): string {
  if (p == null) return "**:data-[slot=progress-indicator]:bg-muted-foreground";
  if (p > 1.2) return "**:data-[slot=progress-indicator]:bg-rose-500";
  if (p < 0.8) return "**:data-[slot=progress-indicator]:bg-orange-400";
  return "**:data-[slot=progress-indicator]:bg-teal-400";
}

export default async function Page() {
  // Every role except content_team may see the dashboard.
  await requireDashboardAccess();

  const [kpi, trend, split, byBook, campaigns] = await Promise.all([
    getDashboardKpis(),
    getSpendTrend(),
    getSpendSplit(),
    getSpendByBook(),
    listCampaigns(),
  ]);

  const trendPoints = trend.map((t) => ({
    label: t.date.slice(5),
    spend: t.spendUZS,
    impressions: t.impressions,
    reach: t.reach,
  }));
  const weeklySpend = trend.slice(-7).reduce((a, t) => a + t.spendUZS, 0);

  const mainDashboard = {
    title: uz.panel.title,
    description: uz.panel.subtitle,
    metrics: [
      {
        label: uz.metrics.spend,
        value: fmtUZS(kpi.spendUZS),
        percentage: uz.metrics.daily,
        isPositive: true,
      },
      {
        label: uz.metrics.remaining,
        value: fmtUZS(kpi.remainingUZS),
        percentage: kpi.burnPct == null ? "—" : `${Math.round(kpi.burnPct)}%`,
        isPositive: (kpi.burnPct ?? 0) <= 100,
      },
    ],
  };
  const secondaryStats = [
    {
      title: uz.panel.weeklySpend,
      value: fmtUZS(weeklySpend),
      percentage: uz.metrics.daily,
      icon: CalendarDays,
      isPositive: true,
      href: "/dashboard/natijalar",
    },
    {
      title: uz.panel.activeCampaigns,
      value: String(kpi.campaignCount),
      percentage: `${fmtNumber(kpi.bookCount)}`,
      icon: Megaphone,
      isPositive: true,
      href: "/dashboard/kampaniyalar",
    },
  ];

  const rows: ProductRow[] = campaigns.slice(0, 6).map((c, i) => ({
    id: c.id,
    name: c.name,
    sub: c.bookTitle ?? "—",
    amount: fmtUZS(c.spendUZS),
    person: c.objective ?? "—",
    personSub: c.funnelStage ?? "—",
    progress: c.pacing == null ? 0 : Math.min(100, Math.round(c.pacing * 100)),
    progressColor: paceColor(c.pacing),
    initials: initialsOf(c.name),
    tint: TINTS[i % TINTS.length],
  }));

  return (
    <AppSidebar>
      <div className="grid grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
        <div className="col-span-12">
          <StatisticsBlock
            mainDashboard={mainDashboard}
            secondaryStats={secondaryStats}
          />
        </div>
        <div className="xl:col-span-8 col-span-12">
          <SalesOverviewChart data={trendPoints} totalUZS={kpi.spendUZS} />
        </div>
        <div className="xl:col-span-4 col-span-12">
          <EarningReportChart
            ads={split.ads}
            blogger={split.blogger}
            production={split.production}
          />
        </div>
        <div className="xl:col-span-8 col-span-12">
          <TopProductTable
            title={uz.topCampaigns.title}
            subtitle={uz.topCampaigns.subtitle}
            rows={rows}
          />
        </div>
        <div className="xl:col-span-4 col-span-12">
          <SalesByCountryWidget books={byBook} />
        </div>
      </div>
    </AppSidebar>
  );
}
