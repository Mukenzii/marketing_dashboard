import { runMetaSync } from "./lib/meta/sync.ts";
console.log("reproducing prod sync: days=30, withEntities=true ...");
try {
  const t=Date.now();
  const s = await runMetaSync({ reset: false, days: 30, withEntities: true });
  console.log("OK summary:", JSON.stringify(s));
} catch (e) {
  console.log("SYNC THREW:", e?.message || e);
  console.log(String(e?.stack||'').split('\n').slice(0,4).join('\n'));
}
process.exit(0);
