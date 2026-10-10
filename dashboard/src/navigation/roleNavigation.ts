import type { Role } from "../types";

/**
 * Role-based navigation — approved information architecture, with an honest
 * live/pending split.
 *
 * `status: "live"`    → path exists in App.tsx and is guarded as documented.
 * `status: "pending"` → product wants the item, but no route (and often no
 *                        backend resource) exists yet, so `path` is null.
 *
 * Pending items are NEVER returned by `navigationForRole()` — a sidebar entry
 * must never point at a route that does not exist.
 *
 * Sidebar.tsx still uses its own `layouts/sidebar/navigation.tsx`; wiring it
 * to this module is a Phase 2 change (it also has to become language-aware).
 * Until then this module is the specification both must satisfy.
 *
 * See docs/ARCHITECTURE-PRODUCT.md §9.
 */

export type NavigationStatus = "live" | "pending";

export type NavigationGroup = "operations" | "administration" | "account";

export interface RoleNavigationItem {
  key: string;
  /** i18n key — see src/i18n. */
  labelKey: string;
  /** null while the item is pending: no route exists. */
  path: string | null;
  roles: readonly Role[];
  status: NavigationStatus;
  group: NavigationGroup;
  /** Required reading for pending items: what blocks them. */
  pendingReason?: string;
}

export const ROLE_NAVIGATION: readonly RoleNavigationItem[] = [
  {
    key: "overview",
    labelKey: "nav.overview",
    path: "/dashboard",
    roles: ["ADMIN", "CLAIMS_OFFICER"],
    status: "live",
    group: "operations",
  },
  {
    key: "claims",
    labelKey: "nav.claims",
    path: "/claims",
    roles: ["ADMIN", "CLAIMS_OFFICER"],
    status: "live",
    group: "operations",
  },
  {
    key: "field-adjusters",
    labelKey: "nav.fieldAdjusters",
    path: "/adjusters",
    roles: ["ADMIN", "CLAIMS_OFFICER"],
    status: "live",
    group: "operations",
  },
  {
    key: "map",
    labelKey: "nav.map",
    path: "/map",
    roles: ["ADMIN", "CLAIMS_OFFICER"],
    status: "live",
    group: "operations",
  },
  {
    key: "assignments",
    labelKey: "nav.assignments",
    path: null,
    roles: ["CLAIMS_OFFICER"],
    status: "pending",
    group: "operations",
    pendingReason:
      "No /assignments route and no GET /assignments endpoint — assignment state lives inside the claim.",
  },
  {
    key: "reports",
    labelKey: "nav.reports",
    path: null,
    roles: ["ADMIN", "CLAIMS_OFFICER"],
    status: "pending",
    group: "operations",
    pendingReason: "No reports endpoint; dashboard figures are derived from GET /claims.",
  },
  {
    key: "users",
    labelKey: "nav.users",
    path: "/settings/users",
    roles: ["ADMIN"],
    status: "live",
    group: "administration",
  },
  {
    key: "settings",
    labelKey: "nav.settings",
    path: "/settings",
    roles: ["ADMIN"],
    status: "live",
    group: "administration",
  },
  {
    key: "profile",
    labelKey: "nav.profile",
    path: "/profile",
    roles: ["ADMIN", "CLAIMS_OFFICER"],
    status: "live",
    group: "account",
  },
  // ─── Field adjuster column (spec) — no surface on the web app today ───────
  {
    key: "adjuster-overview",
    labelKey: "nav.overview",
    path: null,
    roles: ["FIELD_ADJUSTER"],
    status: "pending",
    group: "operations",
    pendingReason: "FIELD_ADJUSTER is blocked from this web dashboard (mobile-app surface).",
  },
  {
    key: "adjuster-my-assignments",
    labelKey: "nav.myAssignments",
    path: null,
    roles: ["FIELD_ADJUSTER"],
    status: "pending",
    group: "operations",
    pendingReason: "FIELD_ADJUSTER is blocked from this web dashboard (mobile-app surface).",
  },
  {
    key: "adjuster-map",
    labelKey: "nav.map",
    path: null,
    roles: ["FIELD_ADJUSTER"],
    status: "pending",
    group: "operations",
    pendingReason: "FIELD_ADJUSTER is blocked from this web dashboard (mobile-app surface).",
  },
  {
    key: "adjuster-my-reports",
    labelKey: "nav.myReports",
    path: null,
    roles: ["FIELD_ADJUSTER"],
    status: "pending",
    group: "operations",
    pendingReason: "FIELD_ADJUSTER is blocked from this web dashboard (mobile-app surface).",
  },
] as const;

export interface NavigationOptions {
  /** Include pending items (for documentation/debug views only). */
  includePending?: boolean;
  /** Return only one group (the sidebar renders groups differently). */
  group?: NavigationGroup;
}

/**
 * Items a role may actually navigate to. Pending items are excluded unless
 * explicitly requested, and an item is only returned when its path exists.
 */
export function navigationForRole(
  role: Role | null | undefined,
  options: NavigationOptions = {},
): RoleNavigationItem[] {
  if (!role) return [];
  const { includePending = false, group } = options;

  return ROLE_NAVIGATION.filter((item) => {
    if (!item.roles.includes(role)) return false;
    if (group && item.group !== group) return false;
    if (!includePending && item.status !== "live") return false;
    return item.path !== null || item.status === "pending";
  });
}

/** Everything the product wants but cannot ship yet, with the blocker. */
export function pendingNavigationItems(
  role?: Role | null,
): RoleNavigationItem[] {
  return ROLE_NAVIGATION.filter(
    (item) =>
      item.status === "pending" && (!role || item.roles.includes(role)),
  );
}

/** True when a path is part of the approved IA (used to validate wiring). */
export function isKnownPath(path: string): boolean {
  return ROLE_NAVIGATION.some((item) => item.path === path);
}
