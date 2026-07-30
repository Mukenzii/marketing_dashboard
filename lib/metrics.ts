/**
 * The ONE place ad metrics are computed. No component or query may duplicate a
 * formula. Two rules the rented tool gets wrong and we must not:
 *
 *  1. Reach is NOT summable across campaigns (summing double-counts people).
 *     Any cross-campaign total must use account-level deduplicated reach
 *     (an insights row with entity_type='account'). `sumRaw` deliberately does
 *     NOT roll child reach up — callers pass the correct dedup reach in.
 *  2. Every ratio recomputes from summed numerator and denominator — never
 *     average child ratios. Frequency = impressions ÷ reach at the display level.
 *
 * Every denominator is zero-guarded and returns `null` (renders as "—"),
 * never NaN/Infinity.
 *
 * ⚠️ HOOK/HOLD are non-standard. Implemented exactly as specified
 * (HOOK = video_3s_views ÷ impressions, HOLD = video_thruplay ÷ video_3s_views)
 * but NOT yet verified against prosales.uz — flag before trusting.
 */

export const n = (v: number | string | null | undefined): number =>
  v == null ? 0 : typeof v === "string" ? Number(v) || 0 : v;

/** Zero-guarded ratio. Returns null (→ "—") when the denominator is 0/absent. */
export const ratio = (num: number, den: number): number | null =>
  den ? num / den : null;

/** Raw, summable metrics (everything EXCEPT reach/frequency). */
export type RawMetrics = {
  spend: number; // in the entity's own currency (usually USD)
  spendUZS: number; // converted at the row's fx_rate
  impressions: number;
  clicks: number;
  uniqueClicks: number;
  inlineLinkClicks: number;
  uniqueInlineLinkClicks: number;
  outboundClicks: number;
  uniqueOutboundClicks: number;
  landingPageViews: number;
  leads: number;
  video3sViews: number;
  videoThruplay: number;
  videoP25: number;
  videoP50: number;
  videoP75: number;
  videoP100: number;
  purchases: number;
  purchaseValue: number;
};

type InsightRow = Partial<Record<keyof RawMetrics, number | string | null>> & {
  spend?: number | string | null;
  fxRate?: number | string | null;
  reach?: number | string | null;
};

const ZERO: RawMetrics = {
  spend: 0,
  spendUZS: 0,
  impressions: 0,
  clicks: 0,
  uniqueClicks: 0,
  inlineLinkClicks: 0,
  uniqueInlineLinkClicks: 0,
  outboundClicks: 0,
  uniqueOutboundClicks: 0,
  landingPageViews: 0,
  leads: 0,
  video3sViews: 0,
  videoThruplay: 0,
  videoP25: 0,
  videoP50: 0,
  videoP75: 0,
  videoP100: 0,
  purchases: 0,
  purchaseValue: 0,
};

/**
 * Sum raw metrics across rows. Reach is intentionally excluded — pass the
 * correct deduplicated reach separately to `computeMetrics`.
 */
export function sumRaw(rows: InsightRow[]): RawMetrics {
  const out = { ...ZERO };
  for (const r of rows) {
    const fx = n(r.fxRate) || 1;
    const spend = n(r.spend);
    out.spend += spend;
    out.spendUZS += spend * fx;
    out.impressions += n(r.impressions);
    out.clicks += n(r.clicks);
    out.uniqueClicks += n(r.uniqueClicks);
    out.inlineLinkClicks += n(r.inlineLinkClicks);
    out.uniqueInlineLinkClicks += n(r.uniqueInlineLinkClicks);
    out.outboundClicks += n(r.outboundClicks);
    out.uniqueOutboundClicks += n(r.uniqueOutboundClicks);
    out.landingPageViews += n(r.landingPageViews);
    out.leads += n(r.leads);
    out.video3sViews += n(r.video3sViews);
    out.videoThruplay += n(r.videoThruplay);
    out.videoP25 += n(r.videoP25);
    out.videoP50 += n(r.videoP50);
    out.videoP75 += n(r.videoP75);
    out.videoP100 += n(r.videoP100);
    out.purchases += n(r.purchases);
    out.purchaseValue += n(r.purchaseValue);
  }
  return out;
}

export type Metrics = {
  ctr: number | null;
  uniqueOutboundCtr: number | null;
  cpm: number | null;
  costPerUniqueLinkClick: number | null;
  cpl: number | null;
  visitRate: number | null;
  leadRate: number | null;
  hookRate: number | null;
  holdRate: number | null;
  frequency: number | null;
  directRoas: number | null;
};

/**
 * Compute all ratio metrics from summed raw + the level's OWN deduped reach.
 * `reach` must be the deduplicated reach for exactly this level (never a sum of
 * child reach). Currency-native (USD) spend is used so CPM/CPL/ROAS read the
 * way marketers expect.
 */
export function computeMetrics(agg: RawMetrics, reach: number): Metrics {
  return {
    ctr: ratio(agg.clicks, agg.impressions),
    uniqueOutboundCtr: ratio(agg.uniqueOutboundClicks, reach),
    cpm:
      agg.impressions > 0 ? (agg.spend / agg.impressions) * 1000 : null,
    costPerUniqueLinkClick: ratio(agg.spend, agg.uniqueInlineLinkClicks),
    cpl: ratio(agg.spend, agg.leads),
    visitRate: ratio(agg.landingPageViews, agg.inlineLinkClicks),
    leadRate: ratio(agg.leads, agg.landingPageViews),
    hookRate: ratio(agg.video3sViews, agg.impressions),
    holdRate: ratio(agg.videoThruplay, agg.video3sViews),
    frequency: ratio(agg.impressions, reach),
    directRoas: ratio(agg.purchaseValue, agg.spend),
  };
}

/**
 * Pacing = (spend ÷ budget) ÷ (days elapsed ÷ flight length). ~1 is on-track,
 * <1 underspending, >1 overspending. Null when budget or flight is unknown.
 */
export function pacing(
  spend: number,
  budget: number,
  daysElapsed: number,
  flightLength: number,
): number | null {
  const spendRatio = ratio(spend, budget);
  const timeRatio = ratio(daysElapsed, flightLength);
  if (spendRatio == null || timeRatio == null) return null;
  return timeRatio ? spendRatio / timeRatio : null;
}

export type BadgeStatus = "ok" | "warn" | "alert";
export type Threshold = {
  warnBelow: number | null;
  warnAbove: number | null;
  alertBelow: number | null;
  alertAbove: number | null;
};

/** Resolve a metric value to an OK/Warn/Alert badge via a threshold rule. */
export function badgeFor(
  value: number | null,
  t: Threshold | undefined,
): BadgeStatus {
  if (value == null || !t) return "ok";
  if (
    (t.alertBelow != null && value < t.alertBelow) ||
    (t.alertAbove != null && value > t.alertAbove)
  )
    return "alert";
  if (
    (t.warnBelow != null && value < t.warnBelow) ||
    (t.warnAbove != null && value > t.warnAbove)
  )
    return "warn";
  return "ok";
}

/** Format a ratio as a percentage string, or "—". */
export const pct = (v: number | null, digits = 2): string =>
  v == null ? "—" : `${(v * 100).toFixed(digits)}%`;

/** Format a plain ratio (e.g. frequency), or "—". */
export const dec = (v: number | null, digits = 2): string =>
  v == null ? "—" : v.toFixed(digits);
