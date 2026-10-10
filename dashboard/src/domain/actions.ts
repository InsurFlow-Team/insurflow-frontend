import type { ClaimStatus, Role } from "../types";
import { hasDashboardAccess } from "./roles";

/**
 * Claim action catalogue — every meaningful button the product plans to show,
 * with the conditions under which it is real.
 *
 * `availability` is the honesty flag:
 *   "web"           – this web app can perform it today (endpoint verified)
 *   "mobile-only"   – backend endpoint exists but is adjuster-only, so the
 *                     web app must never render it
 *   "not-in-backend"– product-wanted action with no backend support yet
 *
 * `webActionsFor()` reproduces the conditions the shipped UI already applies
 * (Assign: NEW + ADMIN/CO; Start Review: SUBMITTED + ADMIN/CO; Approve/Reject:
 * UNDER_REVIEW + ADMIN; Export: final-decision statuses + ADMIN/CO). It is the
 * specification for the labels, not a change to any of them — copy changes
 * ("View Details" → "Review Claim") belong to Phase 2.
 */

export type ClaimActionKey =
  | "REVIEW_CLAIM"
  | "ASSIGN_ADJUSTER"
  | "REASSIGN_ADJUSTER"
  | "START_REVIEW"
  | "APPROVE_CLAIM"
  | "REJECT_CLAIM"
  | "EXPORT_REPORT"
  | "ACCEPT_ASSIGNMENT"
  | "DECLINE_ASSIGNMENT"
  | "START_INSPECTION"
  | "SUBMIT_INSPECTION";

export type ActionAvailability = "web" | "mobile-only" | "not-in-backend";

export interface ClaimActionDefinition {
  key: ClaimActionKey;
  /** i18n key — see src/i18n. */
  labelKey: string;
  availability: ActionAvailability;
  /** null = any claim status. */
  requiresStatus: readonly ClaimStatus[] | null;
  /** null = any role that can reach the claim. */
  requiresRole: readonly Role[] | null;
  /** Backend endpoint that performs it (documentation only, never called here). */
  endpoint?: string;
  note?: string;
}

const DASHBOARD: readonly Role[] = ["ADMIN", "CLAIMS_OFFICER"];
const ADJUSTER: readonly Role[] = ["FIELD_ADJUSTER"];

export const CLAIM_ACTIONS: Record<ClaimActionKey, ClaimActionDefinition> = {
  REVIEW_CLAIM: {
    key: "REVIEW_CLAIM",
    labelKey: "action.REVIEW_CLAIM",
    availability: "web",
    requiresStatus: null,
    requiresRole: DASHBOARD,
    note: "Opens /claims/:claimId — replaces the vague 'View Details' label in Phase 2.",
  },
  ASSIGN_ADJUSTER: {
    key: "ASSIGN_ADJUSTER",
    labelKey: "action.ASSIGN_ADJUSTER",
    availability: "web",
    requiresStatus: ["NEW"],
    requiresRole: DASHBOARD,
    endpoint: "POST /claims/:id/assign",
    note: "Only from NEW. A declined claim returns to NEW, which is how re-dispatch happens.",
  },
  REASSIGN_ADJUSTER: {
    key: "REASSIGN_ADJUSTER",
    labelKey: "action.REASSIGN_ADJUSTER",
    availability: "not-in-backend",
    requiresStatus: null,
    requiresRole: DASHBOARD,
    note: "Reassigning an active assignment is unsupported: POST /claims/:id/assign answers 409 INVALID_STATUS_TRANSITION unless the claim is NEW.",
  },
  START_REVIEW: {
    key: "START_REVIEW",
    labelKey: "action.START_REVIEW",
    availability: "web",
    requiresStatus: ["SUBMITTED"],
    requiresRole: DASHBOARD,
    endpoint: "POST /claims/:id/review/start",
  },
  APPROVE_CLAIM: {
    key: "APPROVE_CLAIM",
    labelKey: "action.APPROVE_CLAIM",
    availability: "web",
    requiresStatus: ["UNDER_REVIEW"],
    requiresRole: ["ADMIN"],
    endpoint: "POST /claims/:id/decision",
    note: "Body field is `decision`, not `status`. Product ruling: final decision belongs to ADMIN.",
  },
  REJECT_CLAIM: {
    key: "REJECT_CLAIM",
    labelKey: "action.REJECT_CLAIM",
    availability: "web",
    requiresStatus: ["UNDER_REVIEW"],
    requiresRole: ["ADMIN"],
    endpoint: "POST /claims/:id/decision",
  },
  EXPORT_REPORT: {
    key: "EXPORT_REPORT",
    labelKey: "action.EXPORT_REPORT",
    availability: "web",
    requiresStatus: ["APPROVED", "REJECTED", "CLOSED"],
    requiresRole: DASHBOARD,
    endpoint: "GET /claims/:id/report",
    note: "Also requires accident details, evidence, signature and inspection location — see api/claims.report.ts.",
  },
  ACCEPT_ASSIGNMENT: {
    key: "ACCEPT_ASSIGNMENT",
    labelKey: "action.ACCEPT_ASSIGNMENT",
    availability: "mobile-only",
    requiresStatus: ["PENDING_ACCEPTANCE"],
    requiresRole: ADJUSTER,
    endpoint: "POST /claims/:id/accept-assignment",
    note: "Adjuster-only endpoint (dashboard roles get 403). The web app has no accept UI.",
  },
  DECLINE_ASSIGNMENT: {
    key: "DECLINE_ASSIGNMENT",
    labelKey: "action.DECLINE_ASSIGNMENT",
    availability: "mobile-only",
    requiresStatus: ["PENDING_ACCEPTANCE"],
    requiresRole: ADJUSTER,
    endpoint: "POST /claims/:id/decline-assignment",
    note: "Transition PENDING_ACCEPTANCE → NEW with a reason; surfaced on the web as claim.lastDecline.",
  },
  START_INSPECTION: {
    key: "START_INSPECTION",
    labelKey: "action.START_INSPECTION",
    availability: "mobile-only",
    requiresStatus: ["ASSIGNED"],
    requiresRole: ADJUSTER,
    endpoint: "POST /claims/:id/inspection/start",
  },
  SUBMIT_INSPECTION: {
    key: "SUBMIT_INSPECTION",
    labelKey: "action.SUBMIT_INSPECTION",
    availability: "mobile-only",
    requiresStatus: ["IN_PROGRESS"],
    requiresRole: ADJUSTER,
    endpoint: "POST /claims/:id/inspection/submit",
    note: "Resubmission path from CORRECTION_REQUIRED is not verified — do not assume it.",
  },
};

export const CLAIM_ACTION_KEYS = Object.keys(CLAIM_ACTIONS) as ClaimActionKey[];

export function actionDefinition(key: ClaimActionKey): ClaimActionDefinition {
  return CLAIM_ACTIONS[key];
}

function matches(
  action: ClaimActionDefinition,
  input: { status: ClaimStatus; role: Role | null | undefined },
): boolean {
  if (action.availability !== "web") return false;
  if (!hasDashboardAccess(input.role)) return false;

  const statusOk =
    action.requiresStatus === null ||
    action.requiresStatus.includes(input.status);
  const roleOk =
    action.requiresRole === null ||
    (input.role !== undefined &&
      input.role !== null &&
      action.requiresRole.includes(input.role));

  return statusOk && roleOk;
}

export function isActionAvailableFor(
  key: ClaimActionKey,
  input: { status: ClaimStatus; role: Role | null | undefined },
): boolean {
  return matches(CLAIM_ACTIONS[key], input);
}

/**
 * Every action this web app may offer for a claim, in catalogue order.
 * Mirrors the shipped UI: assign from NEW, start review from SUBMITTED,
 * decide from UNDER_REVIEW (ADMIN), export after a final decision.
 */
export function webActionsFor(input: {
  status: ClaimStatus;
  role: Role | null | undefined;
}): ClaimActionKey[] {
  return CLAIM_ACTION_KEYS.filter((key) => matches(CLAIM_ACTIONS[key], input));
}

/** Roles the product expects to act on a claim in its current status. */
export function rolesForAction(key: ClaimActionKey): readonly Role[] {
  return CLAIM_ACTIONS[key].requiresRole ?? [];
}
