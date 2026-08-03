import "server-only";

/**
 * Campaign-name parser (§4). Names follow the convention:
 *   "ShK | TOF | <book title> | <objective> | <costCap>$ | dd.mm-dd.mm | <planned>$"
 * but real names are messy (commas for dots, a missing pipe, extra spaces), so
 * this is deliberately tolerant and NEVER throws — worst case parseStatus:"failed".
 */

export type ParsedCampaign = {
  accountCode: string | null;
  funnelStage: string | null;
  parsedBookTitle: string | null;
  parsedObjective: string | null;
  costCap: number | null;
  flightStart: string | null; // ISO yyyy-mm-dd
  flightEnd: string | null;
  plannedBudget: number | null;
  parseStatus: "ok" | "partial" | "failed";
  parseErrors: string[] | null;
};

const FUNNELS = new Set(["TOF", "MOF", "BOF"]);

// Marketing terms that appear in the title slot of badly-named campaigns but are
// NOT book titles.
const OBJECTIVE_WORDS =
  /\b(thru\s*play|lead|lidlar|traf(f)?ic|trafik|awareness|reels?|video|messages?|engagement|conversions?|sms|tg\s*kanal|max\s*oxvat|oxvat|copy|test)\b/i;

/**
 * Is `s` plausibly a real book title (not a date, money, objective, code, or a
 * multi-segment fragment)? Conservative on purpose — a wrong book is worse than
 * no book (the campaign just stays unlinked, and a CEO can link it manually).
 */
function isBookTitle(s: string | null | undefined): boolean {
  if (!s) return false;
  const t = s.trim();
  if (t.length < 3) return false;
  if (!/[a-zA-Zʼʻ'’ʼЀ-ӿ]/.test(t)) return false; // must contain letters
  if (/\$/.test(t)) return false; // money
  if (/\d{1,2}[.,]\d{1,2}([.,]\d{2,4})?/.test(t)) return false; // a date token
  if (/\d{4}/.test(t)) return false; // a year → date
  if (/\s-\s/.test(t)) return false; // captured multiple " - " segments
  if (OBJECTIVE_WORDS.test(t)) return false;
  if (/^(sh|shk|tof|mof|bof)$/i.test(t)) return false; // account / funnel code
  return true;
}

/** "500$", "16 $", "1 000$" → number */
function money(s: string): number | null {
  const m = s.match(/([\d\s.,]+)\s*\$/);
  if (!m) return null;
  const n = Number(m[1].replace(/[\s,]/g, ""));
  return Number.isFinite(n) ? n : null;
}

/** "09.07-09.08" / "07,07-08,08" → [start,end] ISO using `year`. */
function flightRange(s: string, year: number): [string | null, string | null] {
  const norm = s.replace(/,/g, ".");
  const m = norm.match(/(\d{1,2})\.(\d{1,2})\s*[-–]\s*(\d{1,2})\.(\d{1,2})/);
  if (!m) return [null, null];
  const iso = (d: string, mo: string) =>
    `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return [iso(m[1], m[2]), iso(m[3], m[4])];
}

export function parseCampaignName(
  nameRaw: string,
  year: number,
): ParsedCampaign {
  const errors: string[] = [];
  const parts = nameRaw.split("|").map((p) => p.trim());

  const accountCode = parts[0] || null;
  const funnelStage =
    parts.find((p) => FUNNELS.has(p.toUpperCase()))?.toUpperCase() ?? null;
  if (!funnelStage) errors.push("funnel");

  // Book title: ONLY from the clean pipe convention — the segment right after
  // the funnel code — and only if it actually looks like a title. Dash-only
  // names (LEAD/Trafic/ThruPlay campaigns) and date/money/objective slots yield
  // no book, so the campaign stays unlinked rather than inventing a fake book.
  const funnelIdx = parts.findIndex((p) => FUNNELS.has(p.toUpperCase()));
  const titleCandidate =
    parts.length >= 3 && funnelIdx >= 0 ? parts[funnelIdx + 1] : null;
  const parsedBookTitle = isBookTitle(titleCandidate)
    ? (titleCandidate as string).trim()
    : null;
  if (!parsedBookTitle) errors.push("title");

  const parsedObjective =
    (funnelIdx >= 0 ? parts[funnelIdx + 2] : parts[3]) || null;

  // All $-amounts in order: first = costCap, last = plannedBudget.
  const amounts = parts.map(money).filter((n): n is number => n != null);
  const costCap = amounts.length ? amounts[0] : null;
  const plannedBudget = amounts.length ? amounts[amounts.length - 1] : null;
  if (plannedBudget == null) errors.push("planned");

  let flightStart: string | null = null;
  let flightEnd: string | null = null;
  for (const p of parts) {
    const [s, e] = flightRange(p, year);
    if (s) {
      flightStart = s;
      flightEnd = e;
      break;
    }
  }

  const parseStatus: ParsedCampaign["parseStatus"] = !parsedBookTitle
    ? "failed"
    : errors.length === 0
      ? "ok"
      : "partial";

  return {
    accountCode,
    funnelStage,
    parsedBookTitle,
    parsedObjective,
    costCap,
    flightStart,
    flightEnd,
    plannedBudget,
    parseStatus,
    parseErrors: errors.length ? errors : null,
  };
}
