import type { ClaimStatus, Role } from "../types";

// Frontend view of the VERIFIED backend workflow. Backend remains the source of
// truth — this matrix only decides which actions the UI offers, never what the
// API accepts.
//
// Status    Role            Action offered
// NEW       CLAIMS_OFFICER  ASSIGN (POST /claims/:id/assign, NEW → ASSIGNED)
// SUBMITTED any             START_REVIEW (POST /claims/:id/review/start)
//
// Assignment is intentionally limited to CLAIMS_OFFICER even though
// GET /users/adjusters is also allowed for ADMIN.
export type ClaimAction = "ASSIGN" | "START_REVIEW";

const ASSIGNABLE_ROLE: Role = "CLAIMS_OFFICER";

export function getAvailableClaimActions(input: {
  status: ClaimStatus;
  role: Role;
}): ClaimAction[] {
  const actions: ClaimAction[] = [];

  if (input.status === "NEW" && input.role === ASSIGNABLE_ROLE) {
    actions.push("ASSIGN");
  }

  if (input.status === "SUBMITTED") {
    actions.push("START_REVIEW");
  }

  return actions;
}