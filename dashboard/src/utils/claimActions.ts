import type { ClaimStatus, Role } from "../types";
import { hasDashboardAccess } from "../domain/roles";

// Frontend view of the VERIFIED backend workflow. Backend remains the source of
// truth — this matrix only decides which actions the UI offers, never what the
// API accepts.
//
// Status    Role                Action offered
// NEW       ADMIN / CO          ASSIGN (POST /claims/:id/assign, NEW → PENDING_ACCEPTANCE)
// SUBMITTED ADMIN / CO          START_REVIEW (POST /claims/:id/review/start)
//
// Role gates match the shipped UI and the verified backend: both ADMIN and
// CLAIMS_OFFICER may assign (App.tsx guards + live probe), and FIELD_ADJUSTER
// never reaches this code because the dashboard blocks that role at login.
// Richer per-action conditions (status + role + availability) live in
// domain/actions.ts — keep the two in agreement.
export type ClaimAction = "ASSIGN" | "START_REVIEW";

const ASSIGNABLE_ROLES: readonly Role[] = ["ADMIN", "CLAIMS_OFFICER"];
const REVIEWABLE_ROLES: readonly Role[] = ["ADMIN", "CLAIMS_OFFICER"];

export function getAvailableClaimActions(input: {
  status: ClaimStatus;
  role: Role;
}): ClaimAction[] {
  const actions: ClaimAction[] = [];

  if (
    input.status === "NEW" &&
    ASSIGNABLE_ROLES.includes(input.role) &&
    hasDashboardAccess(input.role)
  ) {
    actions.push("ASSIGN");
  }

  if (input.status === "SUBMITTED" && REVIEWABLE_ROLES.includes(input.role)) {
    actions.push("START_REVIEW");
  }

  return actions;
}