"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { uz } from "@/lib/i18n/uz";
import { KeyRound, Check } from "lucide-react";

export default function ChangePasswordButton() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  function reset() {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (next.length < 8) {
      setError(uz.profile.pwTooShort);
      return;
    }
    if (next !== confirm) {
      setError(uz.profile.pwMismatch);
      return;
    }

    start(async () => {
      const res = await authClient.changePassword({
        currentPassword: current,
        newPassword: next,
        revokeOtherSessions: true,
      });
      if (res.error) {
        // Wrong current password is the common case.
        setError(uz.profile.pwWrongCurrent);
        return;
      }
      reset();
      setOpen(false);
      setDone(true);
    });
  }

  if (done) {
    return (
      <p className="flex items-center gap-2 text-sm text-teal-600">
        <Check className="size-4" />
        {uz.profile.pwChanged}
      </p>
    );
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-fit gap-2"
      >
        <KeyRound className="size-4" />
        {uz.profile.changePassword}
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">
          {uz.profile.pwCurrent}
        </label>
        <Input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">
          {uz.profile.pwNew}
        </label>
        <Input
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">
          {uz.profile.pwConfirm}
        </label>
        <Input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={pending} className="gap-2">
          <KeyRound className="size-4" />
          {uz.profile.pwSave}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => {
            reset();
            setOpen(false);
          }}
        >
          {uz.profile.pwCancel}
        </Button>
      </div>
    </form>
  );
}
