"use client";

import { createAuthClient } from "better-auth/react";

// baseURL defaults to the current origin, which is what we want (same-origin
// /api/auth). Exposed helpers are used by the login / reset / logout UI.
export const authClient = createAuthClient();

export const { signIn, signOut, useSession, requestPasswordReset, resetPassword } =
  authClient;
