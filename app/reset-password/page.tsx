"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Logo from "@/assets/logo/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const invalidToken = !token || searchParams.get("error") === "INVALID_TOKEN";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (invalidToken) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <h1 className="text-lg font-semibold text-foreground">
          Link expired or invalid
        </h1>
        <p className="text-sm text-muted-foreground">
          Request a new password reset link to continue.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    const { error } = await authClient.resetPassword({
      newPassword: password,
      token: token!,
    });
    if (error) {
      setError(error.message || "Could not reset password.");
      setPending(false);
      return;
    }
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          New password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="confirm" className="text-sm font-medium text-foreground">
          Confirm password
        </label>
        <Input
          id="confirm"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      {error && (
        <p className="rounded-md bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="h-10 w-full bg-blue-500 text-white hover:bg-blue-500/90"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Set password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col gap-5 p-6">
            <Suspense fallback={null}>
              <ResetForm />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
