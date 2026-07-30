"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Sign out the current user and return to the login screen. */
export async function logout() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
