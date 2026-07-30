import "server-only";

import { ZodError } from "zod";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/lib/dal/errors";

export type ActionResult = { ok: boolean; error?: string };

/** Turn any thrown error into a safe, user-facing Uzbek message. */
export function errMsg(e: unknown): string {
  if (e instanceof ZodError) return e.issues[0]?.message ?? "Ma'lumot noto'g'ri";
  if (
    e instanceof ForbiddenError ||
    e instanceof NotFoundError ||
    e instanceof UnauthorizedError
  )
    return e.message;
  console.error("[action]", e);
  return "Xatolik yuz berdi";
}
