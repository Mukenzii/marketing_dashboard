"use client";

import { useMemo, useState } from "react";
import { BookOpen, ChevronDown, ImageIcon, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

/**
 * Creative thumbnail. Meta's fbcdn images block requests that carry a foreign
 * `Referer`, so send none. Falls back to a placeholder if the URL is missing or
 * still fails (e.g. an expired Meta URL) instead of a broken-image icon.
 */
function Thumb({ src, alt }: { src: string | null; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <ImageIcon className="size-5" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-14 shrink-0 rounded-lg object-cover"
    />
  );
}

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
          <Thumb src={c.thumbnailUrl} alt={c.name} />
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
          {/* headline number */}
          <div className="flex shrink-0 items-center gap-5 text-right">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {uz.creatives.spend}
              </span>
              <span className="text-base font-bold tabular-nums text-card-foreground">
                {fmtUSD(c.spendUSD)}
              </span>
            </div>
          </div>
        </div>

        {/* metric grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <Metric label={uz.creatives.ctr} value={pctOrDash(c.ctr)} toneClass={tone(c.ctr, 0.01, 0.003)} />
          <Metric label={uz.creatives.hookRate} value={pctOrDash(c.hookRate)} toneClass={tone(c.hookRate, 0.25, 0.1)} />
          <Metric label={uz.creatives.holdRate} value={pctOrDash(c.holdRate)} toneClass={tone(c.holdRate, 0.5, 0.2)} />
          <Metric label={uz.creatives.impressions} value={fmtNumber(c.impressions)} />
          <Metric label={uz.creatives.clicks} value={fmtNumber(c.clicks)} />
        </div>
      </CardContent>
    </Card>
  );
}

type BookGroup = {
  key: string;
  title: string;
  items: CreativeRow[];
  spend: number;
};

export default function CreativesBoard({
  creatives,
}: {
  creatives: CreativeRow[];
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Group creatives by book; each group's creatives ranked by spend, groups
  // ranked by total spend.
  const books = useMemo<BookGroup[]>(() => {
    const map = new Map<string, BookGroup>();
    for (const c of creatives) {
      const key = c.bookId ?? c.bookTitle;
      let g = map.get(key);
      if (!g) {
        g = { key, title: c.bookTitle, items: [], spend: 0 };
        map.set(key, g);
      }
      g.items.push(c);
      g.spend += c.spendUSD;
    }
    let list = [...map.values()];
    for (const g of list) g.items.sort((a, b) => b.spendUSD - a.spendUSD);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((g) => g.title.toLowerCase().includes(q));
    list.sort((a, b) => b.spend - a.spend);
    return list;
  }, [creatives, query]);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 text-2xl font-medium text-card-foreground">
          <Trophy className="size-6 text-amber-500" />
          {uz.creatives.ranking}
        </h1>
        <p className="text-sm text-muted-foreground">
          {uz.creatives.byBookSubtitle}
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
          <div className="flex items-center gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={uz.creatives.searchBook}
              className="h-9 sm:max-w-xs"
            />
            <span className="text-xs text-muted-foreground">
              {books.length} {uz.creatives.booksWord} · {creatives.length}{" "}
              {uz.creatives.creativesWord}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {books.map((book) => {
              const open = expanded.has(book.key);
              return (
                <Card
                  key={book.key}
                  className="ring-0 border rounded-2xl py-0 overflow-hidden"
                >
                  <button
                    onClick={() => toggle(book.key)}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                      <BookOpen className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-card-foreground">
                        {book.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {book.items.length} {uz.creatives.creativesWord} ·{" "}
                        {fmtUSD(book.spend)}
                      </p>
                    </div>
                    <Badge className="shrink-0 bg-blue-500/10 font-medium text-blue-600">
                      {book.items.length}
                    </Badge>
                    <ChevronDown
                      className={cn(
                        "size-5 shrink-0 text-muted-foreground transition-transform",
                        open && "rotate-180",
                      )}
                    />
                  </button>
                  {open && (
                    <div className="flex flex-col gap-3 border-t p-4">
                      {book.items.map((c, i) => (
                        <CreativeCard key={c.id} c={c} rank={i} />
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
