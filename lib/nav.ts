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

const BASE = "/dashboard-shell-01";

// Items every authenticated user sees.
const MAIN: NavItem[] = [
  { label: uz.nav.sectionMain, isSection: true },
  { title: uz.nav.dashboard, iconKey: "dashboard", href: BASE },
  { title: uz.nav.creatives, iconKey: "creatives", href: `${BASE}/kreativlar` },
  { title: uz.nav.books, iconKey: "books", href: `${BASE}/kitoblar` },
  { title: uz.nav.tasks, iconKey: "tasks", href: `${BASE}/vazifalar` },
  { title: uz.nav.results, iconKey: "results", href: `${BASE}/natijalar` },
];

// Privileged-only (CEO) items.
const MANAGEMENT: NavItem[] = [
  { label: uz.nav.sectionManagement, isSection: true },
  { title: uz.nav.campaigns, iconKey: "campaigns", href: `${BASE}/kampaniyalar` },
  { title: uz.nav.team, iconKey: "team", href: `${BASE}/jamoa` },
  { title: uz.nav.budgets, iconKey: "budgets", href: `${BASE}/byudjetlar` },
  { title: uz.nav.users, iconKey: "users", href: `${BASE}/foydalanuvchilar` },
  { title: uz.nav.settings, iconKey: "settings", href: `${BASE}/sozlamalar` },
  { title: uz.nav.audit, iconKey: "audit", href: `${BASE}/audit` },
];

/**
 * Build the nav for a privilege level ON THE SERVER. Management items are
 * excluded from the payload for non-privileged users — they never reach that
 * browser at all, not hidden with CSS.
 */
export function getNavForRole(isPrivileged: boolean): NavItem[] {
  return isPrivileged ? [...MAIN, ...MANAGEMENT] : MAIN;
}
