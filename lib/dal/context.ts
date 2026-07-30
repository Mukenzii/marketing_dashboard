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
  isPrivileged: boolean;
  status: "active" | "inactive";
};

/**
 * Resolve the current user. The session is validated by Better Auth, then the
 * user row is read FRESH from the DB (never trust a claim in the cookie) and
 * joined to roles so privilege reflects current DB truth on every request —
 * a demoted or deactivated user loses access on their very next request.
 * Memoized per render pass via React `cache`.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId) return null;

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

  if (!row || row.status !== "active") return null;
  return row as CurrentUser;
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
  if (!user.isPrivileged) redirect("/dashboard-shell-01/ruxsat-yoq");
  return user;
}

/** Non-redirecting variant for server actions / route handlers. */
export async function requireCeoOrThrow(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError();
  if (!user.isPrivileged) throw new ForbiddenError();
  return user;
}
