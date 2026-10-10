import type { ClaimStatus } from "../types";

/**
 * Assignment state — derived, not stored.
 *
 * The backend has NO assignment entity and NO assignment status field: an
 * assignment is `claim.assignment` plus the claim status that the adjuster's
 * actions produce (verified transitions, see claimLifecycle.CLAIM_TRANSITIONS).
 * So this module infers one assignment state from signals the API really
 * returns. Nothing here is written back anywhere.
 *
 * "Overdue acceptance" is deliberately NOT a state: with no acceptance
 * deadline in the backend there is nothing to measure against, so it is
 * documented as pending in domain/sla.ts instead of being simulated.
 */

export type AssignmentStageKey =
  | "NOT_ASSIGNED"
  | "WAITING_ACCEPTANCE"
  | "DECLINED"
  | "ACCEPTED"
  | "INSPECTION_IN_PROGRESS"
  | "CORRECTION_REQUESTED"
  | "COMPLETED";

export interface AssignmentStageDefinition {
  key: AssignmentStageKey;
  labelKey: string;
  /** Claim statuses that can carry this assignment state. */
  claimStatuses: readonly ClaimStatus[];
  /** True when an adjuster is currently attached to the claim. */
  hasAdjuster: boolean;
}

export const ASSIGNMENT_STAGES: readonly AssignmentStageDefinition[] = [
  {
    key: "NOT_ASSIGNED",
    labelKey: "assignmentStage.NOT_ASSIGNED",
    claimStatuses: ["NEW"],
    hasAdjuster: false,
  },
  {
    key: "DECLINED",
    labelKey: "assignmentStage.DECLINED",
    claimStatuses: ["NEW"],
    hasAdjuster: false,
  },
  {
    key: "WAITING_ACCEPTANCE",
    labelKey: "assignmentStage.WAITING_ACCEPTANCE",
    claimStatuses: ["PENDING_ACCEPTANCE"],
    hasAdjuster: true,
  },
  {
    key: "ACCEPTED",
    labelKey: "assignmentStage.ACCEPTED",
    claimStatuses: ["ASSIGNED"],
    hasAdjuster: true,
  },
  {
    key: "INSPECTION_IN_PROGRESS",
    labelKey: "assignmentStage.INSPECTION_IN_PROGRESS",
    claimStatuses: ["IN_PROGRESS"],
    hasAdjuster: true,
  },
  {
    key: "CORRECTION_REQUESTED",
    labelKey: "assignmentStage.CORRECTION_REQUESTED",
    claimStatuses: ["CORRECTION_REQUIRED"],
    hasAdjuster: true,
  },
  {
    key: "COMPLETED",
    labelKey: "assignmentStage.COMPLETED",
    claimStatuses: ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "CLOSED"],
    hasAdjuster: true,
  },
] as const;

const STAGE_BY_KEY: Readonly<Record<AssignmentStageKey, AssignmentStageDefinition>> =
  Object.fromEntries(
    ASSIGNMENT_STAGES.map((stage) => [stage.key, stage]),
  ) as Readonly<Record<AssignmentStageKey, AssignmentStageDefinition>>;

export function assignmentStageByKey(
  key: AssignmentStageKey,
): AssignmentStageDefinition {
  return STAGE_BY_KEY[key];
}

export interface AssignmentSignals {
  status: ClaimStatus;
  /** claim.assignedTo / claim.assignment.assignedTo is present. */
  hasAssignee: boolean;
  /** claim.lastDecline is set — the adjuster turned the offer down. */
  declined?: boolean;
}

/**
 * One rule per state, in priority order:
 *  1. a decline is only visible once the claim is back in NEW (backend does
 *     `PENDING_ACCEPTANCE → NEW` and stamps `lastDecline`);
 *  2. NEW with nobody attached = never assigned;
 *  3. everything else follows the claim status.
 */
export function assignmentStageFor(
  signals: AssignmentSignals,
): AssignmentStageDefinition {
  const { status, hasAssignee, declined } = signals;

  if (status === "NEW") {
    return declined ? STAGE_BY_KEY.DECLINED : STAGE_BY_KEY.NOT_ASSIGNED;
  }

  switch (status) {
    case "PENDING_ACCEPTANCE":
      return STAGE_BY_KEY.WAITING_ACCEPTANCE;
    case "ASSIGNED":
      return STAGE_BY_KEY.ACCEPTED;
    case "IN_PROGRESS":
      return STAGE_BY_KEY.INSPECTION_IN_PROGRESS;
    case "CORRECTION_REQUIRED":
      return STAGE_BY_KEY.CORRECTION_REQUESTED;
    case "SUBMITTED":
    case "UNDER_REVIEW":
    case "APPROVED":
    case "REJECTED":
    case "CLOSED":
      return STAGE_BY_KEY.COMPLETED;
    default:
      // Unreachable while ClaimStatus is exhaustive; kept so a future status
      // degrades to "no assignment state" instead of throwing.
      return hasAssignee
        ? STAGE_BY_KEY.ACCEPTED
        : STAGE_BY_KEY.NOT_ASSIGNED;
  }
}

/** True when a web user could still change who is assigned (only from NEW). */
export function isReassignable(status: ClaimStatus): boolean {
  return status === "NEW";
}
