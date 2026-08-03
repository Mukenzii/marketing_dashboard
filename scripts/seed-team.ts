/**
 * Seeds the real Falaq Nashr marketing team with role-based access.
 * Idempotent — re-running skips existing emails. Passwords hashed with Better
 * Auth's hasher so normal sign-in works. Each person should change their
 * password on first login (Profil → Parolni o'zgartirish).
 *
 * Run:  npm run db:seed:team
 */
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";

import { auth } from "../lib/auth";
import { authDb as db } from "../lib/db/auth-client";
import { users, accounts } from "../lib/db/schema";

const DEV_PASSWORD = process.env.SEED_PASSWORD ?? "Falaq!2026";

type Role =
  | "ceo"
  | "head_of_marketing"
  | "pr_manager"
  | "smm_manager"
  | "content_team";

const TEAM: { name: string; email: string; role: Role }[] = [
  { name: "Giyosiddin", email: "giyosiddin@falaqnashr.uz", role: "ceo" },
  { name: "Muzaffar Mo'minjonov", email: "muzaffar@falaqnashr.uz", role: "head_of_marketing" },
  { name: "Dilorom Mahamadsaxiyeva", email: "dilorom@falaqnashr.uz", role: "pr_manager" },
  { name: "Otabek Abdurahmonov", email: "otabek@falaqnashr.uz", role: "pr_manager" },
  { name: "Sarvar Jo'raboyev", email: "sarvar@falaqnashr.uz", role: "pr_manager" },
  { name: "Ra'no Berdiboyeva", email: "rano@falaqnashr.uz", role: "smm_manager" },
  { name: "Azizxon Tursunov", email: "azizxon@falaqnashr.uz", role: "content_team" },
  { name: "Dilshod Izzatillayev", email: "dilshod@falaqnashr.uz", role: "content_team" },
  { name: "Azizbek Nosirov", email: "azizbek@falaqnashr.uz", role: "content_team" },
];

async function main() {
  const ctx = await auth.$context;

  for (const u of TEAM) {
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

    console.log(`created ${u.role.padEnd(18)} ${u.name} <${u.email}>`);
  }

  const counts = await db.select({ role: users.role }).from(users);
  const tally = counts.reduce<Record<string, number>>((acc, r) => {
    acc[r.role] = (acc[r.role] ?? 0) + 1;
    return acc;
  }, {});
  console.log("\nUser counts by role:", tally);
  console.log(`Temp password for new accounts: ${DEV_PASSWORD}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
