import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

const filters = [
  "All",
  "Design Systems",
  "Engineering",
  "Research",
  "Changelog",
];

type Post = {
  title: string;
  excerpt: string;
  category: string;
  categoryClass: string;
  read: string;
  author: string;
  initials: string;
  avatarClass: string;
  date: string;
};

const posts: Post[] = [
  {
    title: "A density scale that survives real data",
    excerpt:
      "Three spacing modes, one token set, and the rules for when each one is allowed.",
    category: "DESIGN SYSTEMS",
    categoryClass: "text-blue-600",
    read: "6 min read",
    author: "Anna Kowalski",
    initials: "AK",
    avatarClass: "bg-indigo-400/15 text-indigo-600",
    date: "21 Jul",
  },
  {
    title: "Stop shipping charts without empty states",
    excerpt:
      "What a chart should say when the query returns nothing, and who decides the copy.",
    category: "RESEARCH",
    categoryClass: "text-violet-600",
    read: "4 min read",
    author: "Priya Nair",
    initials: "PN",
    avatarClass: "bg-pink-400/15 text-pink-600",
    date: "19 Jul",
  },
  {
    title: "Tokens are an API, treat them like one",
    excerpt:
      "Versioning, deprecation windows and the one breaking change we regret.",
    category: "ENGINEERING",
    categoryClass: "text-teal-600",
    read: "9 min read",
    author: "Marcus Reid",
    initials: "MR",
    avatarClass: "bg-blue-500/15 text-blue-600",
    date: "15 Jul",
  },
  {
    title: "The selection model rewrite",
    excerpt:
      "How one state machine replaced four table implementations across the admin.",
    category: "CHANGELOG",
    categoryClass: "text-orange-600",
    read: "5 min read",
    author: "Elias Lund",
    initials: "EL",
    avatarClass: "bg-teal-400/15 text-teal-600",
    date: "11 Jul",
  },
  {
    title: "Accessible colour in data viz",
    excerpt:
      "Three blues, one green, one amber — and why we never encode meaning in hue alone.",
    category: "DESIGN SYSTEMS",
    categoryClass: "text-blue-600",
    read: "7 min read",
    author: "Anna Kowalski",
    initials: "AK",
    avatarClass: "bg-indigo-400/15 text-indigo-600",
    date: "08 Jul",
  },
  {
    title: "What we learned from 40 support calls",
    excerpt:
      "The three moments where users lose confidence in a dashboard, in their words.",
    category: "RESEARCH",
    categoryClass: "text-violet-600",
    read: "11 min read",
    author: "Hana Sato",
    initials: "HS",
    avatarClass: "bg-orange-400/15 text-orange-600",
    date: "04 Jul",
  },
];

const BlogsPage = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Featured */}
      <Card className="ring-0 border p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="min-h-80 bg-muted" />
          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600">
                FEATURED
              </span>
              <span className="text-sm text-muted-foreground">
                Design Systems · 8 min read
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Designing tables people actually trust
            </h2>

            <p className="text-sm text-muted-foreground">
              Density, alignment and a predictable selection model do more for
              credibility than any amount of visual polish. Here&apos;s the
              checklist we now run every data view through before it ships.
            </p>

            <div className="mt-auto flex items-center gap-3 pt-2">
              <Avatar size="sm">
                <AvatarFallback className="bg-indigo-400/15 text-indigo-600 text-xs font-semibold">
                  AK
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                Anna Kowalski
              </span>
              <span className="text-sm text-muted-foreground">
                22 July 2026
              </span>
              <Button variant="outline" className="ml-auto h-9">
                Read article
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Filter row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter, i) => (
            <button
              key={filter}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                i === 0
                  ? "bg-foreground text-background"
                  : "border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        <InputGroup className="h-9 w-full sm:w-64">
          <InputGroupAddon>
            <Search size={16} />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search articles…" />
        </InputGroup>
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((post) => (
          <Card
            key={post.title}
            className="ring-0 border p-0 transition-colors hover:border-foreground/20"
          >
            <div className="relative h-44 bg-muted">
              <span
                className={cn(
                  "absolute left-3 top-3 rounded-md bg-background px-2 py-0.5 text-xs font-medium",
                  post.categoryClass,
                )}
              >
                {post.category}
              </span>
            </div>

            <div className="flex flex-col gap-2 p-4">
              <span className="text-xs text-muted-foreground">
                {post.read}
              </span>
              <h3 className="font-semibold text-foreground">{post.title}</h3>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>

              <div className="mt-2 flex items-center gap-2 border-t pt-3">
                <Avatar size="sm">
                  <AvatarFallback
                    className={cn("text-xs font-semibold", post.avatarClass)}
                  >
                    {post.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground">{post.author}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {post.date}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
