import "server-only";

/**
 * USD → UZS rate captured at sync time and stored per insight row so the
 * dashboard can render UZS deterministically. Tries a free live source, falls
 * back to META_USD_UZS env, then a sane constant. Never throws.
 */
const FALLBACK = Number(process.env.META_USD_UZS) || 12600;

export async function usdToUzs(): Promise<number> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = (await res.json()) as { rates?: Record<string, number> };
      const uzs = json.rates?.UZS;
      if (uzs && Number.isFinite(uzs) && uzs > 1000) return uzs;
    }
  } catch {
    // ignore — use fallback
  }
  return FALLBACK;
}
