import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                               Small helpers                                */
/* -------------------------------------------------------------------------- */

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-foreground">
      {children}
      {required && <span className="text-rose-500"> *</span>}
    </label>
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

function Radio({ label, selected }: { label: string; selected?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded-full border",
          selected ? "border-blue-500" : "border-input",
        )}
      >
        {selected && <span className="size-2 rounded-full bg-blue-500" />}
      </span>
      <span className="text-sm text-foreground">{label}</span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

const tags = ["design-system", "q3", "admin", "tables", "a11y"];

const FormsPage = () => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_372px]">
      {/* ------------------------------ LEFT ------------------------------ */}
      <Card className="p-0">
        {/* header */}
        <CardHeader className="px-6 pt-6">
          <p className="text-lg font-medium text-foreground">Create Project</p>
          <p className="text-sm text-muted-foreground">
            Fill in the details below. Fields marked with * are required.
          </p>
        </CardHeader>

        {/* body */}
        <CardContent className="flex flex-col gap-6 px-6 pb-6">
          {/* row of 2 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <FieldLabel required>Project name</FieldLabel>
              <Input defaultValue="Shadcn Space Redesign" className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Client</FieldLabel>
              <Input placeholder="Acme Inc." className="h-9" />
            </div>
          </div>

          {/* row of 3 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Category</FieldLabel>
              <select
                defaultValue="Design"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option>Design</option>
                <option>Engineering</option>
                <option>Marketing</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Start date</FieldLabel>
              <Input type="date" defaultValue="2026-08-01" className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Budget</FieldLabel>
              <Input defaultValue="$48,000" className="h-9" />
            </div>
          </div>

          {/* description */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Description</FieldLabel>
            <Textarea
              rows={4}
              defaultValue="Rebuild the admin surface on the new component set, starting with dashboards and tables."
            />
            <p className="text-xs text-muted-foreground">
              Markdown supported. 240 characters remaining.
            </p>
          </div>

          {/* attachments */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Attachments</FieldLabel>
            <div className="rounded-xl border-2 border-dashed p-7 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-muted">
                <Plus className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-foreground">
                Drop files or <span className="text-blue-500">browse</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, PDF up to 10 MB
              </p>
            </div>
          </div>

          {/* row of 2 columns: priority + notifications */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <FieldLabel>Priority</FieldLabel>
              <div className="flex flex-col gap-2.5">
                <Radio label="Low" />
                <Radio label="Medium" selected />
                <Radio label="High" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <FieldLabel>Notifications</FieldLabel>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Email digest</span>
                  <Switch on />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Push alerts</span>
                  <Switch on />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Weekly report</span>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {/* footer bar */}
        <div className="flex flex-col gap-3 rounded-b-xl border-t bg-muted/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2">
            <Checkbox defaultChecked />
            <span className="text-sm text-foreground">
              Notify the team on Slack
            </span>
          </label>
          <div className="flex items-center gap-2">
            <Button variant="outline">Cancel</Button>
            <Button className="bg-blue-500 text-white hover:bg-blue-500/90">
              Create Project
            </Button>
          </div>
        </div>
      </Card>

      {/* ------------------------------ RIGHT ----------------------------- */}
      <div className="flex flex-col gap-6">
        {/* Validation states */}
        <Card className="p-0">
          <CardHeader className="px-6 pt-6">
            <p className="text-lg font-medium text-foreground">
              Validation States
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 px-6 pb-6">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Work email</FieldLabel>
              <Input
                defaultValue="anna@acme.com"
                className="h-9 border-green-600 ring-2 ring-green-600/20 focus-visible:border-green-600 focus-visible:ring-green-600/20"
              />
              <p className="text-xs text-green-600">Looks good.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Password</FieldLabel>
              <Input
                type="password"
                defaultValue="1234"
                className="h-9 border-rose-500 ring-2 ring-rose-500/20 focus-visible:border-rose-500 focus-visible:ring-rose-500/20"
              />
              <p className="text-xs text-rose-500">
                Must be at least 8 characters.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Workspace (locked)</FieldLabel>
              <Input disabled defaultValue="acme-prod" className="h-9" />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="p-0">
          <CardHeader className="px-6 pt-6">
            <p className="text-lg font-medium text-foreground">Tags</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 px-6 pb-6">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground"
                >
                  {tag}
                  <X className="size-3 cursor-pointer text-muted-foreground" />
                </span>
              ))}
              <span className="inline-flex items-center gap-1 rounded-md border border-dashed px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
                <Plus className="size-3" /> Add tag
              </span>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Completion
                </span>
                <span className="text-sm font-bold text-foreground">62%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: "62%" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormsPage;
