import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { eq } from "drizzle-orm";

// Better Auth uses the BYPASSRLS auth connection (granted only the auth tables).
import { authDb as db } from "./db/auth-client";
import { users, sessions, accounts, verifications } from "./db/schema";

const isProd = process.env.NODE_ENV === "production";

// Origins allowed to drive auth (CSRF defense). Add your production URL here.
const trustedOrigins = [
  process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ...(process.env.TRUSTED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ??
    []),
];

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,

  database: drizzleAdapter(db, {
    provider: "pg",
    // map Better Auth models to our (plural) tables
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
    // No public signup — only a CEO creates accounts (see user-management).
    disableSignUp: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    // Dev: no SMTP wired yet — log the reset/invite link. Swap for a real
    // mailer in production.
    sendResetPassword: async ({ user, url }) => {
      console.log(`\n[dev-mail] Password reset for ${user.email}:\n${url}\n`);
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // slide the 30d window at most once/day
    // Cache the validated session in a short-lived signed cookie so most
    // requests skip the session DB lookup entirely. A revoked/expired session
    // stops being honored within this window (60s). Independent of the user-row
    // freshness check in getCurrentUser (see lib/dal/context.ts).
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },

  // Throttle auth endpoints against brute-force / credential-stuffing. The
  // global bucket covers all routes; sign-in and password reset are stricter.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/forget-password": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
    },
  },

  advanced: {
    // Secure cookies in production (HTTPS only).
    useSecureCookies: isProd,
  },

  // role/status/lastLoginAt live on our users table; expose them to Better Auth
  // (input:false → can't be set through the public API, only server-side).
  user: {
    additionalFields: {
      role: { type: "string", input: false, defaultValue: "pr_manager" },
      status: { type: "string", input: false, defaultValue: "active" },
      lastLoginAt: { type: "date", input: false, required: false },
    },
  },

  databaseHooks: {
    session: {
      create: {
        // Deactivated users cannot establish a session — instant lockout.
        before: async (session) => {
          const [u] = await db
            .select({ status: users.status })
            .from(users)
            .where(eq(users.id, session.userId));
          if (!u || u.status !== "active") {
            throw new APIError("FORBIDDEN", {
              message: "This account is inactive. Contact a CEO.",
            });
          }
          return { data: session };
        },
        // Stamp last_login_at on successful sign-in.
        after: async (session) => {
          await db
            .update(users)
            .set({ lastLoginAt: new Date() })
            .where(eq(users.id, session.userId));
        },
      },
    },
  },

  // Must be last: lets Better Auth set cookies from Server Actions / RSC.
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
