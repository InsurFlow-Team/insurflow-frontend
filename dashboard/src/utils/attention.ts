import {
  AlertTriangle,
  ClipboardCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import type { ClaimStatus, ClaimSummary, FieldAdjuster } from "../types";
import { claimStaleThresholdDays } from "../domain/sla";

/**
 * A claim sitting in one of these states is waiting on somebody. The dashboard
 * groups them so an operator can see WHO is blocking each claim instead of
 * reading a raw status count.
 *
 * `waitingOn` is the whole point of the group, and it always names the ROLE
 * that must act next: "officer" = the claims officer queue (assign / start
 * review), "adjuster" = chase the field adjuster, "admin" = only an ADMIN can
 * clear it. Never the viewer's "you" — the label has to stay true for whoever
 * is looking.
 */
export interface AttentionGroupDefinition {
  key: string;
  status: ClaimStatus;
  label: string;
  caption: string;
  waitingOn: "officer" | "adjuster" | "admin";
  icon: LucideIcon;
}

export const ATTENTION_GROUPS: readonly AttentionGroupDefinition[] = [
  {
    key: "needs-assignment",
    status: "NEW",
    label: "Needs Assignment",
    caption: "Waiting to be assigned to an adjuster",
    waitingOn: "officer",
    icon: UserPlus,
  },
  {
    key: "awaiting-acceptance",
    status: "PENDING_ACCEPTANCE",
    label: "Awaiting Adjuster Acceptance",
    caption: "Offered, no response from the adjuster yet",
    waitingOn: "adjuster",
    icon: ClipboardCheck,
  },
  {
    key: "ready-for-review",
    status: "SUBMITTED",
    label: "Ready for Review",
    caption: "Inspection reported, needs Start Review",
    waitingOn: "officer",
    icon: ClipboardCheck,
  },
  {
    key: "awaiting-correction",
    status: "CORRECTION_REQUIRED",
    label: "Awaiting Correction",
    caption: "Sent back, waiting on an updated inspection",
    waitingOn: "adjuster",
    icon: AlertTriangle,
  },
  {
    key: "awaiting-decision",
    status: "UNDER_REVIEW",
    label: "Awaiting Decision",
    caption: "Reviewed, needs a final decision (ADMIN only)",
    waitingOn: "admin",
    icon: AlertTriangle,
  },
] as const;

/** Statuses that mean "somebody is blocked on a person" — the attention set. */
export const ATTENTION_STATUSES: readonly ClaimStatus[] = ATTENTION_GROUPS.map(
  (group) => group.status,
);

/**
 * A claim is flagged overdue from this age.
 *
 * The number lives in `domain/sla.ts` (SLA_RULES.claimStale) so there is one
 * source of truth for the only live SLA rule in the product. Value is
 * unchanged: 3 days. The other product SLA rules are declared there as
 * pending (no backend deadline exists), so they never flag anything here.
 */
export const STALE_AFTER_DAYS = claimStaleThresholdDays();

const MS_PER_DAY = 86_400_000;

/**
 * Whole days since the claim was created, floored at 0. A claim created 1 hour
 * ago is 0 days old, which keeps the "Overdue" warning for genuinely stuck work
 * instead of firing on everything.
 */
export function claimAgeInDays(createdAt: string, now: number = Date.now()): number {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created)) return 0;
  return Math.max(0, Math.floor((now - created) / MS_PER_DAY));
}

export function isOverdue(
  createdAt: string,
  now: number = Date.now(),
  threshold: number = STALE_AFTER_DAYS,
): boolean {
  return claimAgeInDays(createdAt, now) >= threshold;
}

export interface AttentionGroup extends AttentionGroupDefinition {
  count: number;
  /** Age of the single oldest claim in the group, in whole days. */
  oldestAgeDays: number;
  /** True when the oldest claim has reached the stale threshold. */
  isOverdue: boolean;
  claims: ClaimSummary[];
}

const byOldestFirst = (a: ClaimSummary, b: ClaimSummary) =>
  Date.parse(a.createdAt) - Date.parse(b.createdAt);

/**
 * Groups the claims that are blocking somebody. Empty groups are dropped on
 * purpose: an attention queue that lists "0" for five rows is noise, not signal.
 */
export function buildAttentionGroups(
  claims: ClaimSummary[],
  now: number = Date.now(),
): AttentionGroup[] {
  return ATTENTION_GROUPS.map((definition) => {
    const matching = claims
      .filter((claim) => claim.status === definition.status)
      .sort(byOldestFirst);
    const oldest = matching[0];

    return {
      ...definition,
      count: matching.length,
      oldestAgeDays: oldest ? claimAgeInDays(oldest.createdAt, now) : 0,
      isOverdue: matching.length > 0 && isOverdue(oldest!.createdAt, now),
      claims: matching,
    };
  }).filter((group) => group.count > 0);
}

export interface TeamCapacity {
  total: number;
  availableNow: number;
  activeTasks: number;
  /** Spare inspection slots. Adjusters with no capacity limit are excluded. */
  spare: number;
  /** True when at least one adjuster has a null/absent capacity limit. */
  hasUncappedAdjusters: boolean;
}

/**
 * Team capacity from the same rows /adjusters already renders. Adjusters with a
 * null capacityLimit are treated as "not counted" rather than infinite, so a
 * missing limit never inflates the spare number into a false "we have room".
 */
export function summarizeTeamCapacity(adjusters: FieldAdjuster[]): TeamCapacity {
  const counted = adjusters.filter(
    (adjuster) =>
      typeof adjuster.capacityLimit === "number" && adjuster.capacityLimit >= 0,
  );

  const activeTasks = counted.reduce(
    (sum, adjuster) => sum + adjuster.activeTasksCount,
    0,
  );
  const capacity = counted.reduce(
    (sum, adjuster) => sum + (adjuster.capacityLimit as number),
    0,
  );

  return {
    total: adjusters.length,
    availableNow: adjusters.filter((a) => a.availability === "AVAILABLE").length,
    activeTasks,
    spare: Math.max(0, capacity - activeTasks),
    hasUncappedAdjusters: adjusters.length > counted.length,
  };
}

export type HeadroomLevel = "ok" | "tight" | "over";

export interface CapacityHeadroom {
  level: HeadroomLevel;
  /** Claims sitting in NEW with nobody assigned. */
  awaitingAssignment: number;
  spare: number;
  /** Positive when more claims are waiting than there are free slots. */
  shortfall: number;
  message: string;
}

/**
 * Compares unassigned claims against free inspection capacity. This is the
 * question an operator actually has before assigning: "is there room?"
 */
export function capacityHeadroom(
  capacity: TeamCapacity,
  claims: ClaimSummary[],
): CapacityHeadroom {
  const awaitingAssignment = claims.filter(
    (claim) => claim.status === "NEW",
  ).length;
  const { spare } = capacity;
  const shortfall = Math.max(0, awaitingAssignment - spare);
  const level: HeadroomLevel =
    shortfall > 0 ? "over" : awaitingAssignment === 0 ? "ok" : "tight";

  const message =
    level === "over"
      ? `${shortfall} more claim${shortfall === 1 ? "" : "s"} waiting than there are free inspection slots.`
      : level === "tight"
        ? `Capacity covers all ${awaitingAssignment} claim${awaitingAssignment === 1 ? "" : "s"} waiting, with only ${spare} slot${spare === 1 ? "" : "s"} to spare.`
        : "No claims are waiting to be assigned.";

  return { level, awaitingAssignment, spare, shortfall, message };
}
