import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               Small helpers                                */
/* -------------------------------------------------------------------------- */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-foreground">{children}</label>
  );
}

function Switch({ on }: { on?: boolean }) {
  return (
    <span
      role="switch"
      aria-checked={on}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-blue-500" : "bg-muted-foreground/30",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-white shadow-sm transition-transform",
          on ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </span>
  );
}

const steps = [
  { n: 1, label: "Account", state: "done" as const },
  { n: 2, label: "Company", state: "active" as const },
  { n: 3, label: "Billing", state: "upcoming" as const },
  { n: 4, label: "Review", state: "upcoming" as const },
];

const settings = [
  {
    title: "Two-factor authentication",
    body: "Require a second factor for every sign-in.",
    on: true,
  },
  {
    title: "Session timeout",
    body: "Sign members out after 30 minutes of inactivity.",
    on: true,
  },
  {
    title: "Public workspace URL",
    body: "Anyone with the link can view read-only dashboards.",
    on: false,
  },
  {
    title: "Weekly digest",
    body: "Send a Monday summary to all admins.",
    on: false,
  },
];

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

const FormLayoutsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* --------------------------- Stepped ------------------------------ */}
      <Card className="p-0">
        <CardHeader className="px-6 pt-6">
          <p className="text-lg font-medium text-foreground">Stepped Layout</p>
          <p className="text-sm text-muted-foreground">
            For long forms that split into decisions.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 px-6 pb-6">
          {/* stepper */}
          <div className="flex items-center">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={cn(
                  "flex items-center",
                  i < steps.length - 1 && "flex-1",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                      s.state === "done" &&
                        "bg-foreground text-background",
                      s.state === "active" && "bg-blue-500 text-white",
                      s.state === "upcoming" &&
                        "border text-muted-foreground",
                    )}
                  >
                    {s.state === "done" ? <Check className="size-4" /> : s.n}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      s.state === "upcoming"
                        ? "text-muted-foreground"
                        : "text-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <span
                    className={cn(
                      "mx-4 h-px flex-1",
                      s.state === "done" ? "bg-foreground" : "bg-border",
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* fields */}
          <div className="grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Company name</FieldLabel>
              <Input defaultValue="Acme Inc." className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>VAT number</FieldLabel>
              <Input placeholder="PL0000000000" className="h-9" />
            </div>
          </div>

          {/* footer */}
          <div className="flex items-center justify-between">
            <Button variant="outline">Back</Button>
            <Button className="bg-blue-500 text-white hover:bg-blue-500/90">
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --------------------- Horizontal + Sectioned --------------------- */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Horizontal labels */}
        <Card className="p-0">
          <CardHeader className="px-6 pt-6">
            <p className="text-lg font-medium text-foreground">
              Horizontal Labels
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-6 pb-6">
            {[
              { label: "Full name", ph: "Anna Kowalski" },
              { label: "Work email", ph: "anna@acme.com" },
              { label: "Job title", ph: "Principal Designer" },
              { label: "Phone", ph: "+48 000 000 000" },
            ].map((f) => (
              <div
                key={f.label}
                className="grid grid-cols-[130px_1fr] items-center gap-4"
              >
                <label className="text-right text-sm font-medium text-foreground">
                  {f.label}
                </label>
                <Input placeholder={f.ph} className="h-9" />
              </div>
            ))}
            <div className="grid grid-cols-[130px_1fr] items-center gap-4">
              <span />
              <div className="flex items-center gap-2">
                <Button>Save</Button>
                <Button variant="outline">Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sectioned settings */}
        <Card className="p-0">
          <CardHeader className="px-6 pt-6">
            <p className="text-lg font-medium text-foreground">
              Sectioned Settings
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="divide-y">
              {settings.map((s) => (
                <div
                  key={s.title}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {s.title}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.body}</p>
                  </div>
                  <div className="pt-0.5">
                    <Switch on={s.on} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormLayoutsPage;
