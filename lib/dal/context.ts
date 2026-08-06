import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { authDb } from "@/lib/db/auth-client";
import { users, roles } from "@/lib/db/schema";
import { ForbiddenError } from "./errors";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  roleLabel: string;
  isPrivileged: boolean; // CEO or Head of Marketing — sees & manages all
  isCeo: boolean; // CEO only — account management, role changes
  status: "active" | "inactive";
};

/**
 * Short-TTL cache of the user+role row, keyed by user id. Cuts the users⋈roles
 * query on every request down to at most one per TTL window per user, while
 * still refreshing often enough that a demotion/deactivation takes effect within
 * seconds. Admin mutations call `invalidateUser` for instant propagation.
 */
const USER_CACHE_TTL_MS = Number(process.env.USER_CACHE_TTL_MS ?? 20_000);
type UserCacheEntry = { user: CurrentUser | null; expires: number };
const userRowCache = new Map<string, UserCacheEntry>();

/** Drop a user's cached row so their next request re-reads from the DB. */
export function invalidateUser(userId: string): void {
  userRowCache.delete(userId);
}

async function loadUserRow(userId: string): Promise<CurrentUser | null> {
  const now = Date.now();
  const hit = userRowCache.get(userId);
  if (hit && hit.expires > now) return hit.user;

  const [row] = await authDb
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      status: users.status,
      role: users.role,
      roleLabel: roles.name,
      isPrivileged: roles.isPrivileged,
    })
    .from(users)
    .innerJoin(roles, eq(roles.key, users.role))
    .where(eq(users.id, userId));

  const user: CurrentUser | null =
    !row || row.status !== "active"
      ? null
      : ({ ...row, isCeo: row.role === "ceo" } as CurrentUser);

  // Opportunistic prune so the map can't grow unbounded over long uptime.
  if (userRowCache.size > 500) {
    for (const [k, v] of userRowCache) if (v.expires <= now) userRowCache.delete(k);
  }
  userRowCache.set(userId, { user, expires: now + USER_CACHE_TTL_MS });
  return user;
}

/**
 * Resolve the current user. Better Auth validates the session (cookie-cached),
 * then the user+role row is read via a short-TTL cache so privilege reflects
 * DB truth within seconds — a demoted or deactivated user loses access on their
 * next request once the TTL lapses (or immediately if an admin action calls
 * `invalidateUser`). Memoized per render pass via React `cache`.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return null;
  return loadUserRow(userId);
});

/** Page-level guard: returns the user or redirects to /login. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Page-level guard for privileged (CEO) routes: redirects to the no-access
 *  screen when the user is authenticated but not privileged. */
export async function requireCeo(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.isPrivileged) redirect("/dashboard/ruxsat-yoq");
  return user;
}

/** Non-redirecting variant for server actions / route handlers. */
export async function requireCeoOrThrow(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError();
  if (!user.isPrivileged) throw new ForbiddenError();
  return user;
}

/** CEO-ONLY (not even Head): account/role management + Settings. Redirects. */
export async function requireCeoOnly(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.isCeo) redirect("/dashboard/ruxsat-yoq");
  return user;
}

/** CEO-ONLY, non-redirecting (server actions). */
export async function requireCeoOnlyOrThrow(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user?.isCeo) throw new ForbiddenError();
  return user;
}

/**
 * Management pages (Team, Budgets, Audit): CEO + Head of Marketing only. Checks
 * role explicitly (not the is_privileged flag, which PR/SMM also carry).
 */
export async function requireManagement(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role === "ceo" || user.role === "head_of_marketing") return user;
  redirect("/dashboard/ruxsat-yoq");
}

/**
 * Guard a page to a set of roles. Privileged users (CEO / Head of Marketing)
 * always pass. Redirects to the no-access screen otherwise.
 */
export async function requireRoles(allowed: string[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.isPrivileged || allowed.includes(user.role)) return user;
  redirect("/dashboard/ruxsat-yoq");
}

/**
 * Dashboard access rule: EVERY role may use the dashboard except content_team,
 * which only gets Creatives + Tasks. Content is redirected to their landing
 * page. Use this on every shared marketing/operational page so access is
 * governed by one rule instead of per-page role locks.
 */
export async function requireDashboardAccess(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role === "content_team") redirect("/dashboard/kreativlar");
  return user;
}
