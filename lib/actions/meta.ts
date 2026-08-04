"use server";

import { revalidatePath } from "next/cache";
import { requireCeoOrThrow } from "@/lib/dal/context";
import { metaConfigured } from "@/lib/meta/client";
import { runMetaSync } from "@/lib/meta/sync";
import { errMsg, type ActionResult } from "./util";

const BASE = "/dashboard";

/**
 * On-demand Meta refresh (CEO only). Upsert-only — keeps books and their
 * CEO-assigned owners; refreshes campaigns + campaign/account daily insights
 * AND ad sets/ads with ad-level insights (powers the Kreativlar leaderboard).
 */
export async function syncMetaAction(): Promise<ActionResult> {
  try {
    await requireCeoOrThrow();
    if (!metaConfigured())
      return { ok: false, error: "Meta sozlanmagan (.env to'ldirilmagan)" };
    await runMetaSync({ reset: false, days: 30, withEntities: true });
    revalidatePath(BASE, "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
