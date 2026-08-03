/**
 * Seeds the initial user set: 2 CEOs + 6 PR managers (all active).
 * Idempotent — re-running skips existing emails. Passwords are hashed with
 * Better Auth's own hasher so normal sign-in works.
 *
 * Run:  npm run db:seed
 */
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { auth } from "../lib/auth";
// User/account rows are written via the auth connection (RLS is now enforced on
// users/accounts for falaq_app). NOTE: any DOMAIN seeding (books, spend,
// results) must instead go through lib/dal withUser() acting as a CEO — a plain
// insert would silently affect 0 rows under FORCE ROW LEVEL SECURITY.
import { authDb as db } from "../lib/db/auth-client";
import { users, accounts } from "../lib/db/schema";

const DEV_PASSWORD = "Falaq!2026";

const SEED: { name: string; email: string; role: "ceo" | "pr_manager" }[] = [
  { name: "Dilnoza Karimova", email: "ceo1@falaqnashr.uz", role: "ceo" },
  { name: "Sardor Alimov", email: "ceo2@falaqnashr.uz", role: "ceo" },
  { name: "Aziza Yusupova", email: "manager1@falaqnashr.uz", role: "pr_manager" },
  { name: "Bekzod Rakhimov", email: "manager2@falaqnashr.uz", role: "pr_manager" },
  { name: "Gulnora Sattorova", email: "manager3@falaqnashr.uz", role: "pr_manager" },
  { name: "Jasur Tohirov", email: "manager4@falaqnashr.uz", role: "pr_manager" },
  { name: "Malika Ergasheva", email: "manager5@falaqnashr.uz", role: "pr_manager" },
  { name: "Nodir Qodirov", email: "manager6@falaqnashr.uz", role: "pr_manager" },
];

async function main() {
  const ctx = await auth.$context;

  for (const u of SEED) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, u.email));
    if (existing.length) {
      console.log(`skip    ${u.email} (already exists)`);
      continue;
    }

    const id = randomUUID();
    const now = new Date();
    await db.insert(users).values({
      id,
      name: u.name,
      email: u.email,
      emailVerified: true,
      role: u.role,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    const hash = await ctx.password.hash(DEV_PASSWORD);
    await db.insert(accounts).values({
      id: randomUUID(),
      userId: id,
      accountId: id,
      providerId: "credential",
      password: hash,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`created ${u.role.padEnd(10)} ${u.email}`);
  }

  const counts = await db.select({ role: users.role }).from(users);
  const tally = counts.reduce<Record<string, number>>((acc, r) => {
    acc[r.role] = (acc[r.role] ?? 0) + 1;
    return acc;
  }, {});
  console.log("\nUser counts by role:", tally);
  console.log(`Dev password for all seeded users: ${DEV_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
