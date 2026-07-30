import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Proxy (Next.js 16 — renamed from Middleware). OPTIMISTIC redirects only:
 * it checks for the presence of a session cookie and nothing else. It is NOT
 * an authorization boundary — every page, Server Action and DAL function
 * re-verifies the session and scopes data itself (see lib/dal). A matcher gap
 * here must never be able to expose data.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));

  const isDashboard = pathname.startsWith("/dashboard-shell-01");

  // Logged-out visitor to a protected route → login, remembering the target.
  if (isDashboard && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // NOTE: we deliberately do NOT optimistically redirect /login → dashboard on
  // mere cookie presence. A stale/invalid cookie (e.g. after a DB reseed) would
  // otherwise trap the user in a redirect loop: proxy sends /login → dashboard,
  // the page's requireUser rejects the invalid session and sends it back to
  // /login, forever (ERR_TOO_MANY_REDIRECTS). Instead the login page validates
  // the real session client-side and redirects only when it is genuinely valid.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard-shell-01/:path*", "/login"],
};
