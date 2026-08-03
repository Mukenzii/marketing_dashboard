/**
 * CLI: pull live Meta Ads data into the dashboard tables.
 *   npm run sync:meta            → refresh (upsert, keeps books & owners)
 *   npm run sync:meta -- --reset → wipe demo fixtures first, then full sync
 *   npm run sync:meta -- --days 90
 */
import { runMetaSync } from "../lib/meta/sync";

const args = process.argv.slice(2);
const reset = args.includes("--reset");
const withEntities = !args.includes("--no-entities");
const daysIdx = args.indexOf("--days");
const days = daysIdx >= 0 ? Number(args[daysIdx + 1]) : undefined;

runMetaSync({ reset, days, withEntities })
  .then((s) => {
    console.log("\n✅ Meta sync complete:");
    console.log(
      `   accounts=${s.accounts} campaigns=${s.campaigns} adSets=${s.adSets} ads=${s.ads} books=${s.books}`,
    );
    console.log(
      `   insight rows=${s.insightRows}  range=${s.dateFrom} → ${s.dateTo}`,
    );
    process.exit(0);
  })
  .catch((e) => {
    console.error("\n❌ Meta sync failed:\n" + (e as Error).message);
    process.exit(1);
  });
