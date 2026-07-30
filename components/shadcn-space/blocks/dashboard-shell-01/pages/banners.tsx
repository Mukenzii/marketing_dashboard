import {
  ArrowRight,
  Check,
  Info,
  TriangleAlert,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Strip = {
  id: number;
  icon: React.ReactNode;
  lead: string;
  body: string;
  action: string;
  wrap: string;
  glyph: string;
  accent: string;
};

const strips: Strip[] = [
  {
    id: 1,
    icon: <Check className="size-4" />,
    lead: "Deployed.",
    body: "Version 4.2.0 is live across all regions.",
    action: "View release",
    wrap: "bg-teal-400/10",
    glyph: "bg-teal-400/20 text-teal-600",
    accent: "text-teal-600",
  },
  {
    id: 2,
    icon: <TriangleAlert className="size-4" />,
    lead: "Heads up —",
    body: "you are using 48 of 50 seats.",
    action: "Add seats",
    wrap: "bg-orange-400/10",
    glyph: "bg-orange-400/20 text-orange-600",
    accent: "text-orange-600",
  },
  {
    id: 3,
    icon: <X className="size-4" />,
    lead: "Payment failed.",
    body: "The card ending 4242 was declined.",
    action: "Update billing",
    wrap: "bg-rose-500/10",
    glyph: "bg-rose-500/20 text-rose-500",
    accent: "text-rose-500",
  },
  {
    id: 4,
    icon: <Info className="size-4" />,
    lead: "API v3 is here.",
    body: "v2 will be deprecated on 1 December 2026.",
    action: "Read the guide",
    wrap: "bg-blue-500/10",
    glyph: "bg-blue-500/20 text-blue-600",
    accent: "text-blue-600",
  },
];

type Promo = {
  id: number;
  kicker: string;
  title: string;
  body: string;
  action: string;
  card: string;
  kickerColor: string;
  actionColor: string;
};

const promos: Promo[] = [
  {
    id: 1,
    kicker: "ONBOARDING",
    title: "Finish setting up your workspace",
    body: "Three steps left: invite the team, connect billing, pick a default dashboard.",
    action: "Continue setup",
    card: "bg-blue-500/5 border-blue-500/20",
    kickerColor: "text-blue-600",
    actionColor: "text-blue-600",
  },
  {
    id: 2,
    kicker: "TEMPLATE LIBRARY",
    title: "24 ready-made dashboards",
    body: "Start from a layout that already matches your data shape.",
    action: "Browse templates",
    card: "bg-emerald-500/5 border-emerald-500/20",
    kickerColor: "text-emerald-600",
    actionColor: "text-emerald-600",
  },
  {
    id: 3,
    kicker: "REFER A TEAM",
    title: "Give a month, get a month",
    body: "Both workspaces get 30 days of Scale when they upgrade.",
    action: "Get your link",
    card: "bg-violet-500/5 border-violet-500/20",
    kickerColor: "text-violet-600",
    actionColor: "text-violet-600",
  },
];

export default function BannersPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* 1) Notification strips */}
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-foreground">
            Notification Strips
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {strips.map((s) => (
            <div
              key={s.id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3",
                s.wrap,
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  s.glyph,
                )}
              >
                {s.icon}
              </span>
              <p className="min-w-0 flex-1 text-sm text-foreground">
                <span className="font-semibold">{s.lead}</span>{" "}
                <span className="text-muted-foreground">{s.body}</span>
              </p>
              <a
                href="#"
                className={cn(
                  "shrink-0 text-sm font-medium hover:underline",
                  s.accent,
                )}
              >
                {s.action}
              </a>
              <button
                type="button"
                aria-label="Dismiss"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2) Hero banner - dark */}
      <div className="grid grid-cols-1 gap-8 rounded-xl bg-foreground p-10 text-background lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <span className="inline-flex w-fit items-center rounded-full bg-background/15 px-3 py-1 text-xs font-medium">
            SUMMER RELEASE
          </span>
          <h2 className="text-3xl font-medium leading-tight sm:text-4xl">
            Fourteen pages. One component set.
          </h2>
          <p className="text-sm text-background/70">
            Dashboards, tables, forms and widgets rebuilt on the same tokens —
            so the next page you ship already looks finished.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button className="bg-background text-foreground hover:bg-background/90">
              Get the kit
            </Button>
            <Button
              variant="outline"
              className="border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background"
            >
              Changelog
            </Button>
          </div>
        </div>
        <div className="min-h-48 rounded-xl bg-background/10" />
      </div>

      {/* 3) Promo cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {promos.map((p) => (
          <Card key={p.id} className={cn("gap-3", p.card)}>
            <CardContent className="flex flex-col gap-3">
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  p.kickerColor,
                )}
              >
                {p.kicker}
              </span>
              <h3 className="text-lg font-medium text-foreground">{p.title}</h3>
              <p className="text-sm text-muted-foreground">{p.body}</p>
              <a
                href="#"
                className={cn(
                  "mt-1 inline-flex items-center gap-1 text-sm font-medium hover:underline",
                  p.actionColor,
                )}
              >
                {p.action}
                <ArrowRight className="size-3.5" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 4) Cookie consent bar */}
      <Card>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-foreground">
              We use cookies
            </span>
            <span className="text-sm text-muted-foreground">
              Essential cookies keep you signed in. Optional ones help us
              understand which pages get used.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline">Manage</Button>
            <Button variant="outline">Reject all</Button>
            <Button className="bg-foreground text-background hover:bg-foreground/90">
              Accept all
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
