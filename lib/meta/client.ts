import "server-only";
import crypto from "node:crypto";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Thin Meta Marketing API client. Reads credentials from env (server-only,
 * never exposed to the browser). Signs every call with appsecret_proof and
 * follows cursor pagination. Throws a descriptive Error on API errors.
 */

export function metaConfigured(): boolean {
  return Boolean(
    process.env.META_APP_SECRET &&
      process.env.META_ACCESS_TOKEN &&
      process.env.META_AD_ACCOUNT_IDS,
  );
}

/** Ad account ids from env, normalised with the required act_ prefix. */
export function metaAccountIds(): string[] {
  return (process.env.META_AD_ACCOUNT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith("act_") ? s : `act_${s}`));
}

export class MetaClient {
  private token: string;
  private proof: string;
  private version: string;
  private base: string;

  constructor() {
    const token = process.env.META_ACCESS_TOKEN;
    const secret = process.env.META_APP_SECRET;
    if (!token || !secret)
      throw new Error("Meta credentials missing (META_ACCESS_TOKEN / META_APP_SECRET)");
    this.token = token;
    this.proof = crypto.createHmac("sha256", secret).update(token).digest("hex");
    this.version = process.env.META_API_VERSION || "v23.0";
    this.base = `https://graph.facebook.com/${this.version}`;
  }

  // Meta rate-limit / transient error codes → back off and retry.
  private static RETRY_CODES = new Set([4, 17, 32, 341, 613]);
  private static BACKOFF_MS = [20000, 45000, 90000];

  private async get(
    path: string,
    params: Record<string, string> = {},
  ): Promise<Record<string, unknown>> {
    const url = new URL(this.base + path);
    url.searchParams.set("access_token", this.token);
    url.searchParams.set("appsecret_proof", this.proof);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    for (let attempt = 0; ; attempt++) {
      let res: Response;
      try {
        res = await fetch(url, { cache: "no-store" });
      } catch (netErr) {
        if (attempt < MetaClient.BACKOFF_MS.length) {
          await sleep(MetaClient.BACKOFF_MS[attempt]);
          continue;
        }
        throw netErr;
      }
      const json = (await res.json()) as Record<string, unknown>;
      if (res.ok && !json.error) return json;

      const e = (json.error ?? {}) as Record<string, unknown>;
      const code = Number(e.code);
      const retryable =
        MetaClient.RETRY_CODES.has(code) || res.status === 429 || res.status >= 500;
      if (retryable && attempt < MetaClient.BACKOFF_MS.length) {
        const wait = MetaClient.BACKOFF_MS[attempt];
        console.warn(
          `[meta] rate-limited (code ${code}); backing off ${wait / 1000}s (attempt ${attempt + 1})`,
        );
        await sleep(wait);
        continue;
      }
      throw new Error(
        `Meta API ${res.status}: ${e.message ?? JSON.stringify(json)} ` +
          `(type=${e.type} code=${e.code} sub=${e.error_subcode ?? "-"})`,
      );
    }
  }

  /** GET a single node. */
  async node(id: string, fields: string): Promise<Record<string, unknown>> {
    return this.get(`/${id}`, { fields });
  }

  /** GET an edge, following pagination to the end. */
  async edge(
    id: string,
    edge: string,
    fields: string,
    extra: Record<string, string> = {},
  ): Promise<Record<string, unknown>[]> {
    const out: Record<string, unknown>[] = [];
    let path: string | null = `/${id}/${edge}`;
    let params: Record<string, string> = { fields, limit: "500", ...extra };
    // hard cap on pages to avoid runaway loops
    for (let page = 0; page < 50 && path; page++) {
      const json: Record<string, unknown> = await this.get(path, params);
      const data = (json.data as Record<string, unknown>[]) ?? [];
      out.push(...data);
      const paging = json.paging as { next?: string; cursors?: { after?: string } } | undefined;
      const after = paging?.cursors?.after;
      if (paging?.next && after) {
        params = { ...params, after };
      } else {
        path = null;
      }
    }
    return out;
  }
}
