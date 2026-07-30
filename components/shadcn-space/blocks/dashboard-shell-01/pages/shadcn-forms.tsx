import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                               Small helpers                                */
/* -------------------------------------------------------------------------- */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-sm font-medium text-foreground">{children}</label>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

const plans = [
  { name: "Starter", price: "$0 / month", selected: false },
  { name: "Team", price: "$29 / seat", selected: true },
  { name: "Scale", price: "Custom", selected: false },
];

const otp = ["4", "8", "2", "9", "", ""];

const ShadcnFormsPage = () => {
  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {/* ----------------------------- Inputs ----------------------------- */}
      <Card className="p-0">
        <CardHeader className="px-6 pt-6">
          <p className="text-lg font-medium text-foreground">Inputs</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-5 px-6 pb-6">
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Default</FieldLabel>
            <Input placeholder="Placeholder text" className="h-9" />
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>With icon</FieldLabel>
            <InputGroup className="h-9">
              <InputGroupAddon>
                <Mail className="size-4" />
              </InputGroupAddon>
              <InputGroupInput placeholder="you@company.com" />
            </InputGroup>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>With addon</FieldLabel>
            <div className="flex">
              <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-2.5 text-sm text-muted-foreground">
                acme.com/
              </span>
              <Input
                defaultValue="anna"
                className="h-9 rounded-l-none rounded-r-md"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <FieldLabel>Focused</FieldLabel>
            <Input
              defaultValue="Typing…"
              className="h-9 border-blue-500 ring-2 ring-blue-500/20 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Small" className="h-7 text-xs" />
            <Input placeholder="Medium" className="h-9" />
            <Input placeholder="Large" className="h-11 text-base" />
          </div>
        </CardContent>
      </Card>

      {/* --------------------------- Selection ---------------------------- */}
      <Card className="p-0">
        <CardHeader className="px-6 pt-6">
          <p className="text-lg font-medium text-foreground">Selection</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 px-6 pb-6">
          {/* checkboxes */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Checkboxes</FieldLabel>
            <label className="flex items-center gap-2.5">
              <Checkbox defaultChecked />
              <span className="text-sm text-foreground">
                Email me about product updates
              </span>
            </label>
            <label className="flex items-center gap-2.5">
              <span className="flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-primary bg-primary text-primary-foreground">
                <span className="h-0.5 w-2 rounded-full bg-current" />
              </span>
              <span className="text-sm text-foreground">
                Include weekly usage summary
              </span>
            </label>
            <label className="flex items-center gap-2.5">
              <Checkbox />
              <span className="text-sm text-foreground">
                Share anonymous telemetry
              </span>
            </label>
            <label className="flex items-center gap-2.5">
              <Checkbox disabled />
              <span className="text-sm text-muted-foreground">
                Beta features (unavailable)
              </span>
            </label>
          </div>

          {/* segmented radio cards */}
          <div className="flex flex-col gap-3">
            <FieldLabel>Segmented radio cards</FieldLabel>
            <div className="grid grid-cols-3 gap-3">
              {plans.map((p) => (
                <div
                  key={p.name}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-xl border p-3",
                    p.selected
                      ? "border-blue-500 bg-blue-500/5"
                      : "border-border",
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">
                    {p.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* slider */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Slider — 64%</FieldLabel>
            <div className="relative flex items-center py-2">
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: "64%" }}
                />
              </div>
              <span
                className="absolute size-4 -translate-x-1/2 rounded-full border-2 border-blue-500 bg-background shadow-sm"
                style={{ left: "64%" }}
              />
            </div>
          </div>

          {/* OTP */}
          <div className="flex flex-col gap-2">
            <FieldLabel>Verification code</FieldLabel>
            <div className="flex gap-2">
              {otp.map((v, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex h-12 w-11 items-center justify-center rounded-lg border text-lg font-semibold text-foreground",
                    i === 3 ? "border-blue-500" : "border-input",
                  )}
                >
                  {v}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShadcnFormsPage;
