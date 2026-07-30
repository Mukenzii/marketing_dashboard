import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  MoreVertical,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Data                                     */
/* -------------------------------------------------------------------------- */

const tabs = ["Timeline", "About", "Projects", "Followers"];

const stats = [
  { value: "184", label: "Posts" },
  { value: "12.4k", label: "Followers" },
  { value: "386", label: "Following" },
];

const skills = [
  "Design Systems",
  "Accessibility",
  "Figma",
  "Prototyping",
  "Data Viz",
  "Research",
  "Tokens",
];

const followers = [
  { name: "Marcus Reid", role: "Platform Engineer", initials: "MR", tint: "blue" },
  { name: "Priya Nair", role: "Product Manager", initials: "PN", tint: "pink" },
  { name: "Elias Lund", role: "Data Analyst", initials: "EL", tint: "teal" },
  { name: "Hana Sato", role: "Support Lead", initials: "HS", tint: "amber" },
];

const posts = [
  {
    time: "2 hours ago",
    body: "Shipped the new table primitives — selection, faceted filters and column visibility all share one state machine now. Migration guide in the handbook.",
    likes: 248,
    comments: 31,
  },
  {
    time: "Yesterday",
    body: "Small thing that made a big difference: dashed gridlines at 6 steps instead of 10. The charts read faster and the numbers stop competing with the plot.",
    likes: 96,
    comments: 12,
  },
];

const tintMap: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-600",
  pink: "bg-pink-500/15 text-pink-600",
  teal: "bg-teal-500/15 text-teal-600",
  amber: "bg-orange-500/15 text-orange-600",
  indigo: "bg-indigo-500/15 text-indigo-600",
};

/* -------------------------------------------------------------------------- */
/*                                   Page                                     */
/* -------------------------------------------------------------------------- */

const ProfilePage = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* --------------------------- Header card -------------------------- */}
      <Card className="overflow-hidden p-0">
        {/* cover band */}
        <div className="h-44 w-full bg-gradient-to-r from-blue-500/15 to-indigo-500/15" />

        {/* identity row */}
        <div className="flex flex-col gap-4 px-6 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Avatar className="size-28 -mt-14 ring-4 ring-background">
              <AvatarFallback className="bg-indigo-500/15 text-2xl font-semibold text-indigo-600">
                AK
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Anna Kowalski
                </h1>
                <p className="text-sm text-muted-foreground">
                  Principal Product Designer · Design Systems
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" /> Kraków, Poland
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="size-4" /> anna@acme.com
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" /> Joined March 2021
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Message</Button>
            <Button className="bg-foreground text-background hover:bg-foreground/90">
              Follow
            </Button>
          </div>
        </div>

        {/* tabs strip */}
        <div className="flex items-center gap-6 border-t px-6">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "-mb-px border-b-2 py-3 text-sm font-medium transition-colors",
                i === 0
                  ? "border-blue-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </Card>

      {/* ------------------------- Two-column grid ------------------------ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* ----------------------------- LEFT --------------------------- */}
        <div className="flex flex-col gap-6">
          {/* About */}
          <Card className="p-0">
            <CardHeader className="px-6 pt-6">
              <p className="text-lg font-medium text-foreground">About</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-6 pb-6">
              <p className="text-sm text-muted-foreground">
                Twelve years shipping design systems for data-dense products.
                Currently owning the component library, accessibility standards,
                and the tooling that keeps design and code in sync.
              </p>
              <div className="grid grid-cols-3 gap-2 border-t pt-4">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-foreground">
                      {s.value}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="p-0">
            <CardHeader className="px-6 pt-6">
              <p className="text-lg font-medium text-foreground">Skills</p>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Followers */}
          <Card className="p-0">
            <CardHeader className="px-6 pt-6">
              <p className="text-lg font-medium text-foreground">Followers</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 px-6 pb-6">
              {followers.map((f) => (
                <div key={f.name} className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback
                      className={cn("text-xs font-medium", tintMap[f.tint])}
                    >
                      {f.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {f.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {f.role}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    Follow
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ---------------------------- RIGHT --------------------------- */}
        <div className="flex flex-col gap-6">
          {/* composer */}
          <Card className="p-0">
            <CardContent className="flex items-center gap-3 px-6 py-4">
              <Avatar className="size-9">
                <AvatarFallback className="bg-indigo-500/15 text-xs font-medium text-indigo-600">
                  AK
                </AvatarFallback>
              </Avatar>
              <Input
                placeholder="Share an update…"
                className="h-10 flex-1 rounded-full"
              />
              <Button className="rounded-full bg-blue-500 text-white hover:bg-blue-500/90">
                Post
              </Button>
            </CardContent>
          </Card>

          {/* posts */}
          {posts.map((post, i) => (
            <Card key={i} className="p-0">
              <CardContent className="flex flex-col gap-4 px-6 py-5">
                {/* header */}
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-indigo-500/15 text-xs font-medium text-indigo-600">
                      AK
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">
                      Anna Kowalski
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {post.time}
                    </span>
                  </div>
                  <MoreVertical className="size-4 cursor-pointer text-muted-foreground" />
                </div>

                {/* body */}
                <p className="text-sm text-foreground">{post.body}</p>

                {/* media */}
                <div className="h-52 rounded-xl bg-muted" />

                {/* actions */}
                <div className="flex items-center gap-6 border-t pt-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Heart className="size-4" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="size-4" /> {post.comments}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Share2 className="size-4" /> Share
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
