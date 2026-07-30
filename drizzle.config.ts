import { defineConfig } from "drizzle-kit";

// Migrations run as the OWNER role (DDL). The app never uses this connection.
const url = process.env.DATABASE_URL_MIGRATOR;
if (!url) {
  throw new Error("DATABASE_URL_MIGRATOR is not set (see .env)");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
