"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import Logo from "@/assets/logo/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    // Always show the same confirmation regardless of whether the email exists
    // (don't leak which addresses are registered).
    await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setSent(true);
    setPending(false);
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col gap-5 p-6">
            {sent ? (
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-lg font-semibold text-foreground">
                  Check your email
                </h1>
                <p className="text-sm text-muted-foreground">
                  If an account exists for{" "}
                  <span className="font-medium text-foreground">{email}</span>,
                  a password reset link is on its way.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1 text-center">
                  <h1 className="text-lg font-semibold text-foreground">
                    Reset your password
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@falaqnashr.com"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={pending}
                    className="h-10 w-full bg-blue-500 text-white hover:bg-blue-500/90"
                  >
                    {pending && <Loader2 className="size-4 animate-spin" />}
                    Send reset link
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
        <p className="text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
            Back to sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
