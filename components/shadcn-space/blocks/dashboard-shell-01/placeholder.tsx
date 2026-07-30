import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { uz } from "@/lib/i18n/uz";

export function NoAccess() {
  return (
    <div className="mx-auto w-full max-w-[1400px] p-6">
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Lock className="size-6" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            {uz.common.noAccessTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {uz.common.noAccessBody}
          </p>
          <Link
            href="/dashboard-shell-01"
            className="mt-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {uz.common.backToDashboard}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
