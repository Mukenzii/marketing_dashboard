import Link from "next/link";
import AppSidebar from "@/components/shadcn-space/blocks/dashboard-shell-01/app-sidebar";
import ChangePasswordButton from "@/components/shadcn-space/blocks/dashboard-shell-01/pages/change-password-button";
import { requireUser } from "@/lib/dal/context";
import { listBooks } from "@/lib/dal/books";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings } from "lucide-react";
import { uz } from "@/lib/i18n/uz";

const initials = (t: string) =>
  t.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default async function Page() {
  const user = await requireUser();
  const books = user.isPrivileged ? [] : await listBooks();

  return (
    <AppSidebar>
      <div className="mx-auto w-full max-w-[900px] p-6 flex flex-col gap-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {uz.profile.title}
          </h1>
          <p className="text-sm text-muted-foreground">{uz.profile.subtitle}</p>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-blue-500/15 text-blue-600 text-lg font-semibold">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-semibold text-foreground">
                  {user.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className="bg-blue-500/10 text-blue-600 font-medium">
                    {user.roleLabel}
                  </Badge>
                  <Badge
                    className={
                      user.status === "active"
                        ? "bg-teal-400/10 text-teal-600"
                        : "bg-rose-500/10 text-rose-500"
                    }
                  >
                    {user.status === "active"
                      ? uz.profile.active
                      : uz.profile.inactive}
                  </Badge>
                </div>
              </div>
            </div>

            {!user.isPrivileged && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {uz.profile.booksOwned}
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {books.length}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="flex flex-col gap-3 p-6">
            <span className="text-sm font-medium text-foreground">
              {uz.profile.security}
            </span>
            <ChangePasswordButton />
          </CardContent>
        </Card>

        {user.isPrivileged && (
          <Card className="rounded-2xl">
            <CardContent className="flex items-center justify-between p-6">
              <span className="text-sm font-medium text-foreground">
                {uz.profile.appSettings}
              </span>
              <Button
                variant="outline"
                className="gap-2"
                nativeButton={false}
                render={
                  <Link href="/dashboard-shell-01/sozlamalar">
                    <Settings className="size-4" />
                    {uz.profile.goToSettings}
                  </Link>
                }
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AppSidebar>
  );
}
