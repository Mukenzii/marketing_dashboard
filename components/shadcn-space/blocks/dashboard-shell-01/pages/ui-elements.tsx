import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Plus,
  Check,
  AlertTriangle,
  X,
  Info,
  ChevronDown,
  Eye,
  Copy,
  ArrowRight,
  Trash2,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               Small helpers                                */
/* -------------------------------------------------------------------------- */

function CardTitleBlock({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <CardHeader className="px-6 pt-6">
      <p className="text-lg font-medium text-foreground">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </CardHeader>
  );
}

const dotTones: Record<string, { dot: string; text: string }> = {
  teal: { dot: "bg-teal-500", text: "text-teal-600" },
  amber: { dot: "bg-orange-500", text: "text-orange-600" },
  red: { dot: "bg-rose-500", text: "text-rose-500" },
  blue: { dot: "bg-blue-500", text: "text-blue-600" },
  violet: { dot: "bg-violet-500", text: "text-violet-600" },
  neutral: { dot: "bg-muted-foreground", text: "text-muted-foreground" },
  cyan: { dot: "bg-cyan-500", text: "text-cyan-600" },
};

const statuses: { label: string; tone: keyof typeof dotTones }[] = [
  { label: "Active", tone: "teal" },
  { label: "Pending", tone: "amber" },
  { label: "Failed", tone: "red" },
  { label: "Info", tone: "blue" },
  { label: "Beta", tone: "violet" },
  { label: "Draft", tone: "neutral" },
  { label: "Synced", tone: "cyan" },
];

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

const UiElementsPage = () => {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {/* ----------------------------- Buttons ---------------------------- */}
      <Card className="p-0">
        <CardTitleBlock
          title="Buttons"
          description="Variants, sizes and states."
        />
        <CardContent className="flex flex-col gap-4 px-6 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Default</Button>
            <Button className="bg-blue-500 text-white hover:bg-blue-500/90">
              Primary
            </Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="icon" aria-label="Add">
              <Plus />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------- Badges ----------------------------- */}
      <Card className="p-0">
        <CardTitleBlock
          title="Badges"
          description="Status, counts and dot variants."
        />
        <CardContent className="flex flex-col gap-4 px-6 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((s) => (
              <span
                key={s.label}
                className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
              >
                <span
                  className={cn("size-1.5 rounded-full", dotTones[s.tone].dot)}
                />
                {s.label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {statuses.map((s) => (
              <span
                key={s.label}
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  dotTones[s.tone].text,
                )}
              >
                {s.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ----------------------------- Alerts ----------------------------- */}
      <Card className="p-0">
        <CardTitleBlock title="Alerts" />
        <CardContent className="flex flex-col gap-3 px-6 pb-6">
          {[
            {
              title: "Deployment complete",
              body: "Version 4.2.0 is live on production. 0 failed health checks.",
              wrap: "bg-teal-400/10 border-teal-400/20",
              glyph: "bg-teal-400/20 text-teal-600",
              icon: <Check className="size-4" />,
              text: "text-teal-600",
            },
            {
              title: "Seat limit approaching",
              body: "You are using 48 of 50 seats. Add seats before inviting more members.",
              wrap: "bg-orange-400/10 border-orange-400/20",
              glyph: "bg-orange-400/20 text-orange-600",
              icon: <AlertTriangle className="size-4" />,
              text: "text-orange-600",
            },
            {
              title: "Payment failed",
              body: "The card ending 4242 was declined. Update billing to avoid interruption.",
              wrap: "bg-rose-500/10 border-rose-500/20",
              glyph: "bg-rose-500/20 text-rose-500",
              icon: <X className="size-4" />,
              text: "text-rose-500",
            },
            {
              title: "New API version",
              body: "v3 is available. v2 will be deprecated on 1 December 2026.",
              wrap: "bg-blue-500/10 border-blue-500/20",
              glyph: "bg-blue-500/20 text-blue-600",
              icon: <Info className="size-4" />,
              text: "text-blue-600",
            },
          ].map((a) => (
            <div
              key={a.title}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3",
                a.wrap,
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  a.glyph,
                )}
              >
                {a.icon}
              </span>
              <div className="flex flex-col gap-0.5">
                <p className={cn("text-sm font-medium", a.text)}>{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.body}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ---------------------- Avatars & Progress ------------------------ */}
      <Card className="p-0">
        <CardTitleBlock title="Avatars & Progress" />
        <CardContent className="flex flex-col gap-6 px-6 pb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size="sm">
              <AvatarFallback className="bg-blue-500/10 text-xs text-blue-600">
                AK
              </AvatarFallback>
            </Avatar>
            <Avatar size="sm">
              <AvatarFallback className="bg-teal-400/10 text-teal-600">
                MR
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-violet-500/10 text-violet-600">
                JS
              </AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback className="bg-orange-400/10 text-orange-600">
                DP
              </AvatarFallback>
            </Avatar>
            <AvatarGroup className="ml-2">
              <Avatar>
                <AvatarFallback className="bg-blue-500/10 text-blue-600">
                  AK
                </AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback className="bg-teal-400/10 text-teal-600">
                  MR
                </AvatarFallback>
              </Avatar>
              <AvatarGroupCount>+8</AvatarGroupCount>
            </AvatarGroup>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                label: "Storage used",
                pct: 78,
                color: "[&_[data-slot=progress-indicator]]:bg-blue-500",
              },
              {
                label: "Onboarding",
                pct: 42,
                color: "[&_[data-slot=progress-indicator]]:bg-emerald-500",
              },
              {
                label: "API quota",
                pct: 91,
                color: "[&_[data-slot=progress-indicator]]:bg-orange-500",
              },
              {
                label: "Error budget",
                pct: 16,
                color: "[&_[data-slot=progress-indicator]]:bg-rose-500",
              },
            ].map((p) => (
              <div key={p.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{p.label}</span>
                  <span className="text-sm font-medium text-muted-foreground tabular-nums">
                    {p.pct}%
                  </span>
                </div>
                <Progress value={p.pct} className={p.color} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ------------------------ Tabs & Accordion ------------------------ */}
      <Card className="p-0">
        <CardTitleBlock title="Tabs & Accordion" />
        <CardContent className="flex flex-col gap-5 px-6 pb-6">
          {/* segmented tabs */}
          <div className="inline-flex w-fit items-center gap-1 rounded-lg bg-muted p-1">
            {["Account", "Password", "Team"].map((t, i) => (
              <span
                key={t}
                className={cn(
                  "rounded-md px-3 py-1 text-sm font-medium",
                  i === 0
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {t}
              </span>
            ))}
          </div>

          {/* underline tabs */}
          <div className="flex items-center gap-6 border-b">
            {["Overview", "Activity", "Settings"].map((t, i) => (
              <span
                key={t}
                className={cn(
                  "-mb-px border-b-2 pb-2 text-sm font-medium",
                  i === 0
                    ? "border-blue-500 text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {t}
              </span>
            ))}
          </div>

          {/* accordion */}
          <div className="flex flex-col overflow-hidden rounded-xl border">
            {[
              {
                q: "How is the row selection state shared?",
                a: "One reducer owns selection, filters and column visibility. Tables subscribe to it, so bulk actions and pagination stay in sync without prop drilling.",
                open: true,
              },
              {
                q: "Can I override a token locally?",
                a: "Yes, but only at the component boundary — never inline on a leaf node.",
                open: false,
              },
              {
                q: "What breaks in v3?",
                a: "The legacy spacing scale and the two-argument colour helper.",
                open: false,
              },
            ].map((item, i) => (
              <div
                key={item.q}
                className={cn(i > 0 && "border-t")}
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      item.open && "rotate-180",
                    )}
                  />
                </div>
                {item.open && (
                  <div className="px-4 pb-3 text-sm text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------- Overlays ---------------------------- */}
      <Card className="p-0">
        <CardTitleBlock
          title="Overlays"
          description="Dialog, dropdown and tooltip, shown open."
        />
        <CardContent className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-start">
          {/* dialog */}
          <div className="flex-1 rounded-xl border bg-card p-5 shadow-lg">
            <p className="text-base font-medium text-foreground">
              Delete this project?
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              This removes 42 tasks and 3 integrations. This action cannot be
              undone.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm">
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-500 text-white hover:bg-rose-500/90"
              >
                Delete
              </Button>
            </div>
          </div>

          {/* dropdown + tooltip */}
          <div className="flex flex-col gap-4 sm:w-52">
            <div className="rounded-xl border bg-card p-1.5 shadow-lg">
              <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground">
                <Eye className="size-4 text-muted-foreground" />
                View details
              </div>
              <div className="flex items-center gap-2 rounded-md bg-muted px-2.5 py-1.5 text-sm text-foreground">
                <Copy className="size-4 text-muted-foreground" />
                Duplicate
              </div>
              <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground">
                <ArrowRight className="size-4 text-muted-foreground" />
                Move to…
              </div>
              <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-rose-500">
                <Trash2 className="size-4" />
                Delete
              </div>
            </div>

            <div className="flex justify-center">
              <span className="rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-md">
                Copy to clipboard
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UiElementsPage;
