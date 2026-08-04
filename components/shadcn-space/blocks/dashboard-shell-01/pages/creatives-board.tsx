"use client";

import { useMemo, useState } from "react";
import { ImageIcon, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { uz, fmtNumber } from "@/lib/i18n/uz";
import type { CreativeRow } from "@/lib/dal/campaigns";

const fmtUSD = (n: number) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pctOrDash = (v: number | null) =>
  v == null ? "—" : `${(v * 100).toFixed(1)}%`;

/** Green (good) / amber (ok) / red (poor) based on higher-is-better cutoffs. */
function tone(v: number | null, good: number, ok: number): string {
  if (v == null) return "text-muted-foreground";
  if (v >= good) return "text-teal-600";
  if (v >= ok) return "text-amber-600";
  return "text-rose-500";
}

const rankBadge = (i: number) => {
  const medals = ["🥇", "🥈", "🥉"];
  return medals[i] ?? `#${i + 1}`;
};

function Metric({
  label,
  value,
  toneClass,
}: {
  label: string;
  value: string;
  toneClass?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border bg-muted/30 px-3 py-2">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className={cn("text-sm font-semibold tabular-nums", toneClass)}>
        {value}
      </span>
    </div>
  );
}

function CreativeCard({ c, rank }: { c: CreativeRow; rank: number }) {
  return (
    <Card className="ring-0 border rounded-2xl py-0">
      <CardContent className="flex flex-col gap-4 p-4">
        {/* header row */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
            {rankBadge(rank)}
          </div>
          {c.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={c.thumbnailUrl}
              alt={c.name}
              className="size-14 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ImageIcon className="size-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-card-foreground">
              {c.name}
            </p>
            {c.campaignName && (
              <p className="truncate text-xs text-muted-foreground">
                {c.campaignName}
              </p>
            )}
          </div>
          {/* headline numbers */}
          <div className="flex shrink-0 items-center gap-5 text-right">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {uz.creatives.spend}
              </span>
              <span className="text-base font-bold tabular-nums text-card-foreground">
                {fmtUSD(c.spendUSD)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {uz.creatives.leads}
              </span>
              <span className="text-base font-bold tabular-nums text-card-foreground">
                {fmtNumber(c.leads)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {uz.creatives.cpl}
              </span>
              <span className="text-base font-bold tabular-nums text-card-foreground">
                {c.cpl == null ? "—" : fmtUSD(c.cpl)}
              </span>
            </div>
          </div>
        </div>

        {/* metric grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          <Metric label={uz.creatives.ctr} value={pctOrDash(c.ctr)} toneClass={tone(c.ctr, 0.01, 0.003)} />
          <Metric label={uz.creatives.hookRate} value={pctOrDash(c.hookRate)} toneClass={tone(c.hookRate, 0.25, 0.1)} />
          <Metric label={uz.creatives.holdRate} value={pctOrDash(c.holdRate)} toneClass={tone(c.holdRate, 0.5, 0.2)} />
          <Metric label={uz.creatives.visitRate} value={pctOrDash(c.visitRate)} toneClass={tone(c.visitRate, 0.5, 0.2)} />
          <Metric label={uz.creatives.leadRate} value={pctOrDash(c.leadRate)} toneClass={tone(c.leadRate, 0.05, 0.01)} />
          <Metric label={uz.creatives.impressions} value={fmtNumber(c.impressions)} />
          <Metric label={uz.creatives.clicks} value={fmtNumber(c.clicks)} />
          <Metric label={uz.creatives.lpViews} value={fmtNumber(c.landingPageViews)} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreativesBoard({
  creatives,
}: {
  creatives: CreativeRow[];
}) {
  const [campaign, setCampaign] = useState("all");
  const [query, setQuery] = useState("");

  // Campaign filter options, ranked by how many creatives each has.
  const campaigns = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of creatives) {
      if (!m.has(c.campaignId)) m.set(c.campaignId, c.campaignName ?? c.campaignId);
    }
    return [...m.entries()]
      .map(([id, name]) => ({ id, name }))
      .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [creatives, query]);

  const shown = useMemo(() => {
    const list =
      campaign === "all"
        ? creatives
        : creatives.filter((c) => c.campaignId === campaign);
    return [...list].sort((a, b) => b.spendUSD - a.spendUSD);
  }, [creatives, campaign]);

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-medium text-card-foreground">
          <Trophy className="size-6 text-amber-500" />
          {uz.creatives.ranking}
        </h1>
        <p className="text-sm text-muted-foreground">
          {uz.creatives.rankingSubtitle}
        </p>
      </div>

      {creatives.length === 0 ? (
        <Card className="ring-0 border rounded-2xl py-12">
          <CardContent className="flex flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium text-card-foreground">
              {uz.creatives.empty}
            </p>
            <p className="text-xs text-muted-foreground">
              {uz.creatives.syncHint}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* campaign filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={uz.creatives.searchCampaign}
              className="h-9 sm:max-w-xs"
            />
            <select
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:max-w-sm"
            >
              <option value="all">{uz.creatives.allCampaigns}</option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted-foreground">
              {shown.length} / {creatives.length}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {shown.map((c, i) => (
              <CreativeCard key={c.id} c={c} rank={i} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
