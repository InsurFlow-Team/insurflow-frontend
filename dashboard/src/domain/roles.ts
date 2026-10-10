import type { Role } from "../types";

/**
 * Role capability checks — one source of truth for what each role may do in
 * this web app.
 *
 * Every function mirrors behaviour that is ALREADY enforced elsewhere
 * (RoleGuard in App.tsx, page-level `can*` flags, and live-verified backend
 * authorisation recorded in .opencode/skills/masar-rbac). This module does
 * not grant anything new; Phase 2 replaces the inline checks with these
 * functions so the rules stop being restated per page.
 *
 * FIELD_ADJUSTER is deliberately absent from the dashboard rules: the role is
 * blocked from this web app at login (Login.tsx, AuthContext.tsx) and its
 * workflow lives in the mobile app.
 */

export type DashboardRole = "ADMIN" | "CLAIMS_OFFICER";

export const DASHBOARD_ROLES: readonly DashboardRole[] = [
  "ADMIN",
  "CLAIMS_OFFICER",
];

export function hasDashboardAccess(
  role: Role | null | undefined,
): role is DashboardRole {
  return role === "ADMIN" || role === "CLAIMS_OFFICER";
}

/** Assign an adjuster — verified: both roles pass on POST /claims/:id/assign. */
export function canAssignClaim(role: Role | null | undefined): boolean {
  return hasDashboardAccess(role);
}

/** Open the claims queue / claim details / adjuster directory / map. */
export function canViewOperations(role: Role | null | undefined): boolean {
  return hasDashboardAccess(role);
}

/** Start review (SUBMITTED → UNDER_REVIEW) — POST /claims/:id/review/start. */
export function canStartReview(role: Role | null | undefined): boolean {
  return hasDashboardAccess(role);
}

/** Final decision (APPROVE / REJECT) — ADMIN only, per product ruling. */
export function canDecideClaim(role: Role | null | undefined): boolean {
  return role === "ADMIN";
}

/** Users + Settings + user status/reset actions — ADMIN only. */
export function canManageUsers(role: Role | null | undefined): boolean {
  return role === "ADMIN";
}

/** Export the claim report PDF once a final decision exists. */
export function canExportReport(role: Role | null | undefined): boolean {
  return hasDashboardAccess(role);
}

/** Change own password (Profile) — available to every dashboard role. */
export function canChangeOwnPassword(role: Role | null | undefined): boolean {
  return hasDashboardAccess(role);
}
