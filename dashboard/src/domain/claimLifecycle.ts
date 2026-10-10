import type { ClaimStatus } from "../types";

/**
 * Canonical product lifecycle for a claim.
 *
 * The BACKEND remains the source of truth for status values — nothing here
 * renames them. This module is the single place that translates
 * `ClaimStatus` (what the API returns) into the stage the product talks
 * about (what the UI should say).
 *
 * The one trap this exists to prevent: the product's "ASSIGNED" stage means
 * *offered, waiting for the adjuster* (backend `PENDING_ACCEPTANCE`), while
 * the backend's `ASSIGNED` actually means *the adjuster accepted* (product
 * stage `ACCEPTED`). Never display the raw enum as a stage name.
 *
 * Mapping is verified against live backend transition events (2026-10-03),
 * see `CLAIM_TRANSITIONS` below and docs/ARCHITECTURE-PRODUCT.md §6.
 */

export type ClaimStageKey =
  | "NEW"
  | "INTAKE_REVIEW"
  | "READY_FOR_ASSIGNMENT"
  | "AWAITING_ACCEPTANCE"
  | "ACCEPTED"
  | "INSPECTION_IN_PROGRESS"
  | "REPORT_SUBMITTED"
  | "CORRECTION_REQUIRED"
  | "UNDER_DECISION"
  | "APPROVED"
  | "REJECTED"
  | "CLOSED"
  | "ON_HOLD"
  | "CANCELLED";

export type ClaimPhase =
  | "intake"
  | "dispatch"
  | "inspection"
  | "decision"
  | "closed"
  | "exception";

/** Who the claim is waiting on to move out of this stage. */
export type StageOwner = "claims_officer" | "admin" | "adjuster" | "none";

export interface ClaimStageDefinition {
  key: ClaimStageKey;
  /** i18n key — see src/i18n. Phase 2 renders labels from here. */
  labelKey: string;
  phase: ClaimPhase;
  /** Display order along the happy path; exception stages sort last. */
  order: number;
  /** Backend statuses that realise this stage. Empty = no backend support. */
  backendStatuses: readonly ClaimStatus[];
  /** False for proposed stages the backend cannot produce today. */
  availableInBackend: boolean;
  waitingOn: StageOwner;
}

export const CLAIM_STAGES: readonly ClaimStageDefinition[] = [
  {
    key: "NEW",
    labelKey: "claimStage.NEW",
    phase: "intake",
    order: 1,
    backendStatuses: [],
    availableInBackend: false,
    waitingOn: "none",
  },
  {
    key: "INTAKE_REVIEW",
    labelKey: "claimStage.INTAKE_REVIEW",
    phase: "intake",
    order: 2,
    backendStatuses: [],
    availableInBackend: false,
    waitingOn: "claims_officer",
  },
  {
    key: "READY_FOR_ASSIGNMENT",
    labelKey: "claimStage.READY_FOR_ASSIGNMENT",
    phase: "dispatch",
    order: 3,
    backendStatuses: ["NEW"],
    availableInBackend: true,
    waitingOn: "claims_officer",
  },
  {
    key: "AWAITING_ACCEPTANCE",
    labelKey: "claimStage.AWAITING_ACCEPTANCE",
    phase: "dispatch",
    order: 4,
    backendStatuses: ["PENDING_ACCEPTANCE"],
    availableInBackend: true,
    waitingOn: "adjuster",
  },
  {
    key: "ACCEPTED",
    labelKey: "claimStage.ACCEPTED",
    phase: "inspection",
    order: 5,
    backendStatuses: ["ASSIGNED"],
    availableInBackend: true,
    waitingOn: "adjuster",
  },
  {
    key: "INSPECTION_IN_PROGRESS",
    labelKey: "claimStage.INSPECTION_IN_PROGRESS",
    phase: "inspection",
    order: 6,
    backendStatuses: ["IN_PROGRESS"],
    availableInBackend: true,
    waitingOn: "adjuster",
  },
  {
    key: "REPORT_SUBMITTED",
    labelKey: "claimStage.REPORT_SUBMITTED",
    phase: "decision",
    order: 7,
    backendStatuses: ["SUBMITTED"],
    availableInBackend: true,
    waitingOn: "claims_officer",
  },
  {
    key: "CORRECTION_REQUIRED",
    labelKey: "claimStage.CORRECTION_REQUIRED",
    phase: "inspection",
    order: 8,
    backendStatuses: ["CORRECTION_REQUIRED"],
    availableInBackend: true,
    waitingOn: "adjuster",
  },
  {
    key: "UNDER_DECISION",
    labelKey: "claimStage.UNDER_DECISION",
    phase: "decision",
    order: 9,
    backendStatuses: ["UNDER_REVIEW"],
    availableInBackend: true,
    waitingOn: "admin",
  },
  {
    key: "APPROVED",
    labelKey: "claimStage.APPROVED",
    phase: "closed",
    order: 10,
    backendStatuses: ["APPROVED"],
    availableInBackend: true,
    waitingOn: "none",
  },
  {
    key: "REJECTED",
    labelKey: "claimStage.REJECTED",
    phase: "closed",
    order: 11,
    backendStatuses: ["REJECTED"],
    availableInBackend: true,
    waitingOn: "none",
  },
  {
    key: "CLOSED",
    labelKey: "claimStage.CLOSED",
    phase: "closed",
    order: 12,
    backendStatuses: ["CLOSED"],
    availableInBackend: true,
    waitingOn: "none",
  },
  {
    key: "ON_HOLD",
    labelKey: "claimStage.ON_HOLD",
    phase: "exception",
    order: 13,
    backendStatuses: [],
    availableInBackend: false,
    waitingOn: "none",
  },
  {
    key: "CANCELLED",
    labelKey: "claimStage.CANCELLED",
    phase: "exception",
    order: 14,
    backendStatuses: [],
    availableInBackend: false,
    waitingOn: "none",
  },
] as const;

export const STAGE_BY_KEY: Readonly<Record<ClaimStageKey, ClaimStageDefinition>> =
  Object.fromEntries(
    CLAIM_STAGES.map((stage) => [stage.key, stage]),
  ) as Readonly<Record<ClaimStageKey, ClaimStageDefinition>>;

/**
 * Exhaustive on purpose: TypeScript fails the build if a backend status is
 * added without a product stage, so the mapping can never silently rot.
 */
export const STAGE_FOR_STATUS: Readonly<Record<ClaimStatus, ClaimStageKey>> = {
  NEW: "READY_FOR_ASSIGNMENT",
  PENDING_ACCEPTANCE: "AWAITING_ACCEPTANCE",
  ASSIGNED: "ACCEPTED",
  IN_PROGRESS: "INSPECTION_IN_PROGRESS",
  SUBMITTED: "REPORT_SUBMITTED",
  UNDER_REVIEW: "UNDER_DECISION",
  CORRECTION_REQUIRED: "CORRECTION_REQUIRED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CLOSED: "CLOSED",
};

export function stageForStatus(status: ClaimStatus): ClaimStageDefinition {
  const key = STAGE_FOR_STATUS[status];
  return STAGE_BY_KEY[key];
}

export function stageByKey(key: ClaimStageKey): ClaimStageDefinition {
  return STAGE_BY_KEY[key];
}

export function stagesInPhase(phase: ClaimPhase): ClaimStageDefinition[] {
  return CLAIM_STAGES.filter((stage) => stage.phase === phase);
}

/**
 * Proposed stages the current backend cannot produce. Listed so the product
 * can decide whether to build them — never rendered as if they existed.
 */
export function stagesWithoutBackendSupport(): ClaimStageDefinition[] {
  return CLAIM_STAGES.filter((stage) => !stage.availableInBackend);
}

/** A claim in a final decision state (report export unlocks here). */
export function isFinalDecisionStatus(status: ClaimStatus): boolean {
  return status === "APPROVED" || status === "REJECTED" || status === "CLOSED";
}

// ─── Verified transitions ─────────────────────────────────────────────────────

export interface ClaimTransition {
  /** null = claim entry point. */
  from: ClaimStatus | null;
  to: ClaimStatus;
  /** Backend timeline action name — owned by the backend, do not translate. */
  action: string;
}

/**
 * Transitions observed in real claim timelines (live probe 2026-10-03).
 * `CORRECTION_REQUIRED` and `CLOSED` are valid backend statuses with no
 * observed writer from the web app, so they are intentionally absent.
 */
export const CLAIM_TRANSITIONS: readonly ClaimTransition[] = [
  { from: null, to: "NEW", action: "Claim Created" },
  { from: "NEW", to: "PENDING_ACCEPTANCE", action: "Assignment Pending Acceptance" },
  { from: "PENDING_ACCEPTANCE", to: "ASSIGNED", action: "Assignment Accepted" },
  { from: "PENDING_ACCEPTANCE", to: "NEW", action: "Assignment Declined" },
  { from: "ASSIGNED", to: "IN_PROGRESS", action: "Inspection Started" },
  { from: "IN_PROGRESS", to: "SUBMITTED", action: "Inspection Submitted" },
  { from: "SUBMITTED", to: "UNDER_REVIEW", action: "Review Started" },
  { from: "UNDER_REVIEW", to: "APPROVED", action: "Claim Approved" },
  { from: "UNDER_REVIEW", to: "REJECTED", action: "Claim Rejected" },
] as const;

export function isKnownTransition(
  from: ClaimStatus | null,
  to: ClaimStatus,
): boolean {
  return CLAIM_TRANSITIONS.some(
    (transition) => transition.from === from && transition.to === to,
  );
}

export function isStageAvailableInBackend(key: ClaimStageKey): boolean {
  return STAGE_BY_KEY[key].availableInBackend;
}
