/**
 * Create (or reset) the FIRST admin — a single CEO — with your own credentials.
 * Everything else is done from the dashboard afterwards. Idempotent: if the
 * email already exists, it's promoted to an active CEO and its password reset.
 *
 * Local:  npm run db:create-admin -- you@example.com 'StrongPass' 'Your Name'
 * Docker: docker compose run --rm seed \
 *           node --import tsx scripts/create-admin.ts you@example.com 'StrongPass' 'Your Name'
 */
import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";

import { auth } from "../lib/auth";
import { authDb as db } from "../lib/db/auth-client";
import { users, accounts } from "../lib/db/schema";

async function main() {
  const [, , email, password, ...nameParts] = process.argv;
  const name = nameParts.join(" ").trim();

  if (!email || !password) {
    console.error(
      "Usage: create-admin.ts <email> <password> [name]\n" +
        "Example: create-admin.ts ceo@falaqnashr.uz 'StrongPass123' Giyosiddin",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  const now = new Date();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    const id = existing.id;
    await db
      .update(users)
      .set({ role: "ceo", status: "active", emailVerified: true, updatedAt: now })
      .where(eq(users.id, id));

    const [acct] = await db
      .select({ id: accounts.id })
      .from(accounts)
      .where(and(eq(accounts.userId, id), eq(accounts.providerId, "credential")));

    if (acct) {
      await db
        .update(accounts)
        .set({ password: hash, updatedAt: now })
        .where(eq(accounts.id, acct.id));
    } else {
      await db.insert(accounts).values({
        id: randomUUID(),
        userId: id,
        accountId: id,
        providerId: "credential",
        password: hash,
        createdAt: now,
        updatedAt: now,
      });
    }
    console.log(`Updated existing user ${email} → active CEO, password reset.`);
  } else {
    const id = randomUUID();
    await db.insert(users).values({
      id,
      name: name || email.split("@")[0],
      email,
      emailVerified: true,
      role: "ceo",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(accounts).values({
      id: randomUUID(),
      userId: id,
      accountId: id,
      providerId: "credential",
      password: hash,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Created CEO ${email}.`);
  }

  console.log("You can now sign in and add everyone else from Foydalanuvchilar.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
