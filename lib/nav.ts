import { uz } from "@/lib/i18n/uz";

// Icons are referenced by string key so the (server-built, server-filtered) nav
// can cross the RSC boundary into the client sidebar. The client resolves the
// key to a lucide component (see nav-main.tsx). Never put component functions
// on these objects — they aren't serializable.
export type NavIconKey =
  | "dashboard"
  | "creatives"
  | "books"
  | "tasks"
  | "results"
  | "campaigns"
  | "team"
  | "budgets"
  | "users"
  | "settings"
  | "audit";

export type NavItem = {
  label?: string;
  isSection?: boolean;
  title?: string;
  iconKey?: NavIconKey;
  href?: string;
  children?: NavItem[];
  isActive?: boolean;
};

const BASE = "/dashboard";

const sectionMain: NavItem = { label: uz.nav.sectionMain, isSection: true };
const sectionMgmt: NavItem = { label: uz.nav.sectionManagement, isSection: true };

const I = {
  dashboard: { title: uz.nav.dashboard, iconKey: "dashboard", href: BASE },
  creatives: { title: uz.nav.creatives, iconKey: "creatives", href: `${BASE}/kreativlar` },
  books: { title: uz.nav.books, iconKey: "books", href: `${BASE}/kitoblar` },
  tasks: { title: uz.nav.tasks, iconKey: "tasks", href: `${BASE}/vazifalar` },
  results: { title: uz.nav.results, iconKey: "results", href: `${BASE}/natijalar` },
  campaigns: { title: uz.nav.campaigns, iconKey: "campaigns", href: `${BASE}/kampaniyalar` },
  team: { title: uz.nav.team, iconKey: "team", href: `${BASE}/jamoa` },
  budgets: { title: uz.nav.budgets, iconKey: "budgets", href: `${BASE}/byudjetlar` },
  users: { title: uz.nav.users, iconKey: "users", href: `${BASE}/foydalanuvchilar` },
  settings: { title: uz.nav.settings, iconKey: "settings", href: `${BASE}/sozlamalar` },
  audit: { title: uz.nav.audit, iconKey: "audit", href: `${BASE}/audit` },
} satisfies Record<string, NavItem>;

/**
 * Nav is built and filtered ON THE SERVER per role — items a role can't reach
 * never enter that browser's payload (not merely hidden with CSS).
 * - content_team: creatives + tasks only (the only restricted role)
 * - every other role (ceo, head_of_marketing, pr_manager, smm_manager): everything
 */
export function getNavForRole(role: string): NavItem[] {
  // Only content_team is restricted — it gets Creatives + Tasks and no dashboard.
  if (role === "content_team") {
    return [sectionMain, I.creatives, I.tasks];
  }
  // Every other role gets the full dashboard.
  return [
    sectionMain, I.dashboard, I.creatives, I.books, I.tasks, I.results,
    sectionMgmt, I.campaigns, I.team, I.budgets, I.users, I.settings, I.audit,
  ];
}
