/**
 * Demo domain data for Falaq: ad account, books (owned by managers), campaigns
 * linked to books, Meta-shaped daily insights fixtures (ad + campaign + account
 * levels, with deduped reach that is deliberately LESS than the sum of children),
 * blogger/production spend, results, and tasks.
 *
 * Runs on the OWNER connection (superuser bypasses RLS). Idempotent: truncates
 * the domain tables and re-seeds. Users/roles are untouched.
 *
 * Run:  npm run db:seed:demo
 */
import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as s from "../lib/db/schema";

const url = process.env.DATABASE_URL_MIGRATOR;
if (!url) throw new Error("DATABASE_URL_MIGRATOR not set");
const sqlc = postgres(url, { prepare: false });
const db = drizzle(sqlc, { schema: s });

const FX = 12600; // USD -> UZS
const DAYS = 10;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysAgo = (k: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - k);
  return d;
};
// deterministic pseudo-random so re-seeds are stable
let _s = 12345;
const rnd = () => {
  _s = (_s * 1103515245 + 12345) & 0x7fffffff;
  return _s / 0x7fffffff;
};
const between = (a: number, b: number) => a + (b - a) * rnd();
const iBetween = (a: number, b: number) => Math.round(between(a, b));

type Brand = "falaq_nashr" | "falaq_kids";
// Real, well-known titles Falaq Nashr translates into Uzbek (adult imprint),
// and Falaq Kids children's classics.
const BOOKS: { title: string; brand: Brand; mgr: number }[] = [
  { title: "Alkimyogar", brand: "falaq_nashr", mgr: 1 }, // The Alchemist
  { title: "Atom odatlar", brand: "falaq_nashr", mgr: 1 }, // Atomic Habits
  { title: "Kichkina shahzoda", brand: "falaq_kids", mgr: 1 }, // The Little Prince
  { title: "Boy ota, kambag'al ota", brand: "falaq_nashr", mgr: 2 }, // Rich Dad Poor Dad
  { title: "O'rmon kitobi", brand: "falaq_kids", mgr: 2 }, // The Jungle Book
  { title: "Do'st orttirish san'ati", brand: "falaq_nashr", mgr: 3 }, // How to Win Friends
  { title: "Alisa mo''jizalar mamlakatida", brand: "falaq_kids", mgr: 3 }, // Alice
  { title: "Chol va dengiz", brand: "falaq_nashr", mgr: 4 }, // The Old Man and the Sea
  { title: "Piter Pen", brand: "falaq_kids", mgr: 4 }, // Peter Pan
  { title: "Namozning sirlari", brand: "falaq_nashr", mgr: 5 }, // Islamic
  { title: "Buratino", brand: "falaq_kids", mgr: 5 },
  { title: "Qalb tibbiyoti", brand: "falaq_nashr", mgr: 6 }, // Islamic self-help
];

const FUNNELS = ["TOF", "MOF", "BOF"];
const OBJECTIVES = ["ThruPlay", "Lidlar", "Trafik"];

async function main() {
  const users = await db
    .select({ id: s.users.id, email: s.users.email })
    .from(s.users);
  const idOf = (email: string) => users.find((u) => u.email === email)!.id;
  const mgr = (k: number) => idOf(`manager${k}@falaqnashr.com`);
  const ceo = idOf("ceo1@falaqnashr.com");

  console.log("truncating domain tables…");
  await sqlc.unsafe(`
    TRUNCATE TABLE insights_daily, ads, ad_sets, campaigns, ad_accounts,
      spend_entries, results, task_comments, tasks, sync_runs, books
    RESTART IDENTITY CASCADE;
  `);

  // ad account
  const acctId = randomUUID();
  await db.insert(s.adAccounts).values({
    id: acctId,
    metaAccountId: "act_falaq_001",
    name: "Falaq Nashr Ads",
    currency: "USD",
    timezone: "Asia/Tashkent",
  });

  const accountDailyReach: number[] = new Array(DAYS).fill(0);

  let bookIdx = 0;
  for (const b of BOOKS) {
    bookIdx++;
    const bookId = randomUUID();
    const budgetUZS = iBetween(25, 90) * 1_000_000;
    const flightStart = daysAgo(DAYS + 2);
    const flightEnd = daysAgo(-20);
    await db.insert(s.books).values({
      id: bookId,
      title: b.title,
      brand: b.brand,
      ownerId: mgr(b.mgr),
      launchDate: iso(daysAgo(-25)),
      budgetAllocated: String(budgetUZS),
      currency: "UZS",
      fxRate: "1",
      status: "active",
    });

    // one campaign per book
    const objective = OBJECTIVES[iBetween(0, OBJECTIVES.length - 1)];
    const funnel = FUNNELS[iBetween(0, FUNNELS.length - 1)];
    const costCap = iBetween(8, 24);
    const planned = iBetween(300, 900);
    const campId = randomUUID();
    const metaCampId = `mc_${bookIdx}`;
    await db.insert(s.campaigns).values({
      id: campId,
      metaCampaignId: metaCampId,
      accountId: acctId,
      nameRaw: `ShK | ${funnel} | ${b.title} | ${objective} | ${costCap}$ | ${iso(flightStart).slice(5)}-${iso(flightEnd).slice(5)} | ${planned}$`,
      objective,
      status: "ACTIVE",
      dailyBudget: String(iBetween(20, 60)),
      lifetimeBudget: null,
      startTime: flightStart,
      stopTime: flightEnd,
      bookId,
      bookLinkConfirmed: true,
      accountCode: "ShK",
      funnelStage: funnel,
      parsedBookTitle: b.title,
      parsedObjective: objective,
      costCap: String(costCap),
      flightStart: iso(flightStart),
      flightEnd: iso(flightEnd),
      plannedBudget: String(planned),
      parseStatus: "ok",
    });

    const adSetId = randomUUID();
    await db.insert(s.adSets).values({
      id: adSetId,
      metaAdsetId: `as_${bookIdx}`,
      campaignId: campId,
      name: `${b.title} — ${funnel}`,
      optimizationGoal: objective === "Lidlar" ? "LEAD_GENERATION" : "THRUPLAY",
      bidStrategy: "COST_CAP",
      bidAmount: String(costCap),
      dailyBudget: String(iBetween(20, 60)),
    });

    const nAds = iBetween(2, 3);
    const campDailyReach: number[] = new Array(DAYS).fill(0);
    for (let a = 0; a < nAds; a++) {
      const adId = randomUUID();
      const metaAdId = `ad_${bookIdx}_${a}`;
      await db.insert(s.ads).values({
        id: adId,
        metaAdId,
        adSetId,
        name: `Kreativ ${a + 1} — ${b.title}`,
        creativeId: `cr_${bookIdx}_${a}`,
        thumbnailUrl: null,
        status: "ACTIVE",
      });

      for (let d = 0; d < DAYS; d++) {
        const date = iso(daysAgo(DAYS - d));
        const impressions = iBetween(2000, 12000);
        const reach = Math.round(impressions * between(0.55, 0.8)); // < impressions
        const spend = +between(4, 22).toFixed(2);
        const clicks = iBetween(30, 300);
        const inlineLink = Math.round(clicks * between(0.5, 0.8));
        const outbound = Math.round(inlineLink * between(0.7, 0.95));
        const v3s = Math.round(impressions * between(0.25, 0.55));
        const thru = Math.round(v3s * between(0.15, 0.45));
        const lpv = Math.round(inlineLink * between(0.4, 0.75));
        const leads =
          objective === "Lidlar" ? Math.round(lpv * between(0.05, 0.18)) : 0;
        campDailyReach[d] += reach;
        await db.insert(s.insightsDaily).values({
          entityType: "ad",
          entityId: metaAdId,
          campaignId: campId,
          adAccountId: acctId,
          date,
          currency: "USD",
          fxRate: String(FX),
          spend: String(spend),
          impressions,
          reach,
          frequency: String(+(impressions / reach).toFixed(4)),
          clicks,
          uniqueClicks: Math.round(clicks * 0.85),
          inlineLinkClicks: inlineLink,
          uniqueInlineLinkClicks: Math.round(inlineLink * 0.9),
          outboundClicks: outbound,
          uniqueOutboundClicks: Math.round(outbound * 0.9),
          landingPageViews: lpv,
          leads,
          video3sViews: v3s,
          videoThruplay: thru,
          videoP25: Math.round(v3s * 0.7),
          videoP50: Math.round(v3s * 0.5),
          videoP75: Math.round(v3s * 0.35),
          videoP100: thru,
          purchases: 0,
          purchaseValue: "0",
        });
      }
    }

    // campaign-level rows: deduped reach (< sum of ad reach)
    for (let d = 0; d < DAYS; d++) {
      const date = iso(daysAgo(DAYS - d));
      const dedupReach = Math.round(campDailyReach[d] * between(0.6, 0.75));
      accountDailyReach[d] += dedupReach;
      const impressions = iBetween(5000, 26000);
      const spend = +between(12, 60).toFixed(2);
      await db.insert(s.insightsDaily).values({
        entityType: "campaign",
        entityId: metaCampId,
        campaignId: campId,
        adAccountId: acctId,
        date,
        currency: "USD",
        fxRate: String(FX),
        spend: String(spend),
        impressions,
        reach: dedupReach,
        frequency: String(+(impressions / dedupReach).toFixed(4)),
        clicks: iBetween(80, 700),
        uniqueClicks: iBetween(70, 600),
        inlineLinkClicks: iBetween(50, 450),
        uniqueInlineLinkClicks: iBetween(45, 400),
        outboundClicks: iBetween(40, 380),
        uniqueOutboundClicks: iBetween(35, 340),
        landingPageViews: iBetween(30, 280),
        leads: objective === "Lidlar" ? iBetween(3, 40) : 0,
        video3sViews: iBetween(1500, 9000),
        videoThruplay: iBetween(300, 3000),
        videoP25: iBetween(1000, 6000),
        videoP50: iBetween(700, 4000),
        videoP75: iBetween(400, 2500),
        videoP100: iBetween(300, 2000),
        purchases: 0,
        purchaseValue: "0",
      });
    }

    // manual spend: blogger + production (UZS)
    await db.insert(s.spendEntries).values([
      {
        bookId,
        type: "blogger",
        amount: String(iBetween(2, 8) * 1_000_000),
        currency: "UZS",
        fxRate: "1",
        vendor: ["@kitobsevar", "@mutolaa_uz", "@bookgram"][iBetween(0, 2)],
        promoCode: `FALAQ${iBetween(10, 40)}`,
        spentAt: iso(daysAgo(iBetween(2, 9))),
        createdBy: mgr(b.mgr),
        notes: "Instagram reels + story",
      },
      {
        bookId,
        type: "production",
        amount: String(iBetween(1, 4) * 1_000_000),
        currency: "UZS",
        fxRate: "1",
        vendor: "Studio Falaq",
        spentAt: iso(daysAgo(iBetween(3, 10))),
        createdBy: mgr(b.mgr),
        notes: "Video + dizayn",
      },
    ]);

    // a couple of result rows
    await db.insert(s.results).values({
      bookId,
      reach: iBetween(8000, 40000),
      views: iBetween(20000, 120000),
      engagement: iBetween(500, 4000),
      clicks: iBetween(300, 2500),
      directOrders: iBetween(5, 90),
      revenue: String(iBetween(3, 20) * 1_000_000),
      currency: "UZS",
      fxRate: "1",
      recordedAt: daysAgo(1),
      createdBy: mgr(b.mgr),
    });
  }

  // account-level dedup reach rows
  for (let d = 0; d < DAYS; d++) {
    const date = iso(daysAgo(DAYS - d));
    const dedup = Math.round(accountDailyReach[d] * between(0.5, 0.65));
    const impressions = iBetween(60000, 200000);
    await db.insert(s.insightsDaily).values({
      entityType: "account",
      entityId: "act_falaq_001",
      campaignId: null,
      adAccountId: acctId,
      date,
      currency: "USD",
      fxRate: String(FX),
      spend: String(+between(200, 600).toFixed(2)),
      impressions,
      reach: dedup,
      frequency: String(+(impressions / dedup).toFixed(4)),
      clicks: iBetween(1500, 9000),
      uniqueClicks: iBetween(1300, 8000),
      inlineLinkClicks: iBetween(900, 6000),
      uniqueInlineLinkClicks: iBetween(800, 5000),
      outboundClicks: iBetween(700, 4800),
      uniqueOutboundClicks: iBetween(600, 4200),
      landingPageViews: iBetween(500, 3500),
      leads: iBetween(40, 300),
      video3sViews: iBetween(20000, 90000),
      videoThruplay: iBetween(4000, 30000),
      videoP25: iBetween(14000, 60000),
      videoP50: iBetween(9000, 40000),
      videoP75: iBetween(5000, 25000),
      videoP100: iBetween(4000, 20000),
      purchases: 0,
      purchaseValue: "0",
    });
  }

  // tasks
  const statuses = ["todo", "in_progress", "review", "done", "blocked"] as const;
  const prios = ["low", "normal", "high"] as const;
  const titles = [
    "Kreativ yangilash",
    "Byudjetni qayta ko'rib chiqish",
    "Bloger bilan shartnoma",
    "A/B test tayyorlash",
    "Hisobotni topshirish",
    "Landing sahifani tekshirish",
    "Yangi kampaniya ishga tushirish",
    "Frequency yuqori — kreativ almashtirish",
    "Promo-kodlarni yangilash",
    "Oylik natijalarni yig'ish",
  ];
  const allBooks = await db.select({ id: s.books.id, ownerId: s.books.ownerId }).from(s.books);
  for (let i = 0; i < 16; i++) {
    const book = allBooks[iBetween(0, allBooks.length - 1)];
    const assignee = book.ownerId ?? mgr(1);
    const st = statuses[iBetween(0, statuses.length - 1)];
    const overdue = rnd() < 0.3;
    await db.insert(s.tasks).values({
      title: titles[i % titles.length],
      description: "Falaq marketing vazifasi",
      bookId: book.id,
      assigneeId: assignee,
      createdBy: ceo,
      status: st,
      priority: prios[iBetween(0, prios.length - 1)],
      dueDate: iso(daysAgo(overdue ? iBetween(1, 6) : -iBetween(1, 14))),
      completedAt: st === "done" ? daysAgo(1) : null,
    });
  }

  // a recent successful sync
  await db.insert(s.syncRuns).values({
    startedAt: daysAgo(0),
    finishedAt: new Date(),
    status: "success",
    dateFrom: iso(daysAgo(7)),
    dateTo: iso(daysAgo(0)),
    rowsUpserted: 420,
  });

  const counts = await sqlc`select
      (select count(*) from books) books,
      (select count(*) from campaigns) campaigns,
      (select count(*) from insights_daily) insights,
      (select count(*) from spend_entries) spend,
      (select count(*) from tasks) tasks`;
  console.log("seeded:", counts[0]);
  await sqlc.end();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
