import "server-only";

// Guarded entry point for the DB client. App components, route handlers, and
// the DAL import from here so the client can never be pulled into a Client
// Component bundle. Scripts and the auth config import "./client" directly.
export { db, schema } from "./client";
export type { Db } from "./client";
