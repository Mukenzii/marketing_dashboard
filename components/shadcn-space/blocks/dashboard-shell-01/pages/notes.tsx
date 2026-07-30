import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus, MoreVertical, Archive, Trash2 } from "lucide-react";

type Category = {
  label: string;
  count: number;
  dot: string;
  active?: boolean;
};

const categories: Category[] = [
  { label: "All Notes", count: 18, dot: "bg-foreground", active: true },
  { label: "Work", count: 7, dot: "bg-blue-500" },
  { label: "Personal", count: 4, dot: "bg-emerald-500" },
  { label: "Ideas", count: 5, dot: "bg-orange-500" },
  { label: "Reading", count: 2, dot: "bg-violet-500" },
];

type Note = {
  tag: string;
  tagClass: string;
  title: string;
  body: string;
  date: string;
  cardClass: string;
};

const notes: Note[] = [
  {
    tag: "WORK",
    tagClass: "bg-blue-500/10 text-blue-600",
    title: "Table selection model",
    body: "One state machine for row selection, faceted filters and column visibility. Ship behind a flag first, migrate Orders, then Invoices.",
    date: "24 Jul 2026",
    cardClass: "bg-blue-500/5 border-blue-500/20",
  },
  {
    tag: "IDEAS",
    tagClass: "bg-orange-400/10 text-orange-600",
    title: "Dashboard density toggle",
    body: "Airy / balanced / dense as a single token switch. Only line-height, row padding and chart height change — nothing structural.",
    date: "23 Jul 2026",
    cardClass: "bg-orange-400/5 border-orange-400/20",
  },
  {
    tag: "WORK",
    tagClass: "bg-muted text-muted-foreground",
    title: "Chart palette audit",
    body: "Three blues is enough for stacked series. Reserve green for won/positive and amber for pending — never for a data series.",
    date: "22 Jul 2026",
    cardClass: "bg-card border",
  },
  {
    tag: "PERSONAL",
    tagClass: "bg-teal-400/10 text-teal-600",
    title: "Conference talk outline",
    body: "Open with the trust angle, then the checklist, close with the migration numbers. 18 minutes, no live demo.",
    date: "20 Jul 2026",
    cardClass: "bg-emerald-500/5 border-emerald-500/20",
  },
  {
    tag: "READING",
    tagClass: "bg-violet-500/10 text-violet-600",
    title: "Papers to finish",
    body: "Two on progressive disclosure in dense UI, one on perceived latency and skeleton states.",
    date: "18 Jul 2026",
    cardClass: "bg-violet-500/5 border-violet-500/20",
  },
  {
    tag: "IDEAS",
    tagClass: "bg-muted text-muted-foreground",
    title: "Empty states as onboarding",
    body: "Every empty table gets one sentence of context and one primary action. No illustrations without a job.",
    date: "16 Jul 2026",
    cardClass: "bg-card border",
  },
];

const NotesPage = () => {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left sidebar */}
      <div className="w-full lg:w-[260px] lg:shrink-0">
        <Card className="ring-0 border p-4 gap-4">
          <Button className="w-full gap-1.5 bg-foreground text-background hover:bg-foreground/90 h-9">
            <Plus size={16} />
            <span>New Note</span>
          </Button>

          <div className="flex flex-col gap-1">
            <p className="px-2 text-xs font-semibold tracking-wide text-muted-foreground">
              CATEGORIES
            </p>
            {categories.map((cat) => (
              <button
                key={cat.label}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                  cat.active && "bg-muted",
                )}
              >
                <span className={cn("size-2 rounded-full", cat.dot)} />
                <span className="flex-1 text-left text-foreground">
                  {cat.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <button className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted">
              <Archive size={16} />
              <span>Archived</span>
            </button>
            <button className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted">
              <Trash2 size={16} />
              <span>Trash</span>
            </button>
          </div>
        </Card>
      </div>

      {/* Right notes grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <Card
              key={note.title}
              className={cn(
                "ring-0 flex flex-col gap-3 p-4",
                note.cardClass,
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "rounded-md px-2 py-0.5 text-xs font-medium",
                    note.tagClass,
                  )}
                >
                  {note.tag}
                </span>
                <button className="text-muted-foreground transition-colors hover:text-foreground">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold text-foreground">{note.title}</h3>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {note.body}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t pt-3">
                <span className="text-xs text-muted-foreground">
                  {note.date}
                </span>
                <a
                  href="#"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Edit
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
