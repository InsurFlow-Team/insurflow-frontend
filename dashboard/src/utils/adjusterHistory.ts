import type {
  AdjusterWorkHistoryEntry,
  ClaimDetails,
  ClaimStatus,
  ClaimSummary,
  TimelineItem,
} from "../types";

// A claim is "completed" once a final decision was made. Approved and rejected
// both end the adjuster's work; closed means it was also settled.
export const COMPLETED_CLAIM_STATUSES = [
  "APPROVED",
  "REJECTED",
  "CLOSED",
] as const;

// GET /claims only accepts `status`, so a claim carries no precomputed counters.
// The inspection count and completion time live in the claim timeline, which
// costs one GET /claims/:id per completed claim. Cap the fan-out so a long
// history can never fire an unbounded request burst; `truncated` tells the UI
// to say so instead of quietly showing a partial total.
export const MAX_HISTORY_DETAIL_FETCHES = 25;

const INSPECTION_STARTED_PATTERN = /inspection\s+start/i;

const FINAL_DECISION_PATTERN = /(claim\s+)?(approved|rejected|closed)/i;

const MS_PER_HOUR = 3_600_000;

export function isCompletedStatus(
  status: ClaimStatus | string | null | undefined,
): boolean {
  return (COMPLETED_CLAIM_STATUSES as readonly string[]).includes(
    status as string,
  );
}

function timeOf(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function selectCompletedClaims(
  claims: ClaimSummary[],
  adjusterId: string,
): ClaimSummary[] {
  if (!adjusterId) return [];

  return claims
    .filter(
      (claim) =>
        claim.assignedTo?.id === adjusterId && isCompletedStatus(claim.status),
    )
    .sort(
      (a, b) =>
        timeOf(b.updatedAt ?? b.createdAt) - timeOf(a.updatedAt ?? a.createdAt),
    );
}

// A revisit logs a second "Inspection Started" event, so the count reflects
// how many times the adjuster actually went out, not how many claims exist.
export function countInspections(
  timeline: TimelineItem[] | null | undefined,
  adjusterId?: string,
): number {
  if (!Array.isArray(timeline)) return 0;

  return timeline.filter((event) => {
    if (!INSPECTION_STARTED_PATTERN.test(event.action ?? "")) return false;
    if (!adjusterId) return true;
    return event.performedBy?.id === adjusterId;
  }).length;
}

// The completion moment is read only from the claim's own record: closedAt for
// a settled claim, otherwise the decision event. A summary's updatedAt is never
// used — it moves for any later edit and would report a wrong time.
export function resolveCompletedAt(
  details: ClaimDetails | null | undefined,
): string | null {
  if (!details) return null;

  // A closed claim carries the authoritative settlement timestamp.
  if (details.closedAt) return details.closedAt;

  // Otherwise the decision event is the completion moment.
  const decisionEvent = [...(details.timeline ?? [])]
    .reverse()
    .find((event) => FINAL_DECISION_PATTERN.test(event.action ?? ""));

  return decisionEvent?.timestamp ?? null;
}

export function computeDurationHours(
  assignedAt: string | null | undefined,
  completedAt: string | null | undefined,
): number | null {
  const start = timeOf(assignedAt);
  const end = timeOf(completedAt);

  if (!assignedAt || !completedAt || start === 0 || end === 0) return null;
  if (end < start) return null;

  return (end - start) / MS_PER_HOUR;
}

export function formatDuration(hours: number | null): string {
  if (hours === null || !Number.isFinite(hours) || hours < 0) return "—";

  const totalMinutes = Math.round(hours * 60);

  if (totalMinutes < 1) return "<1m";

  const days = Math.floor(totalMinutes / 1440);
  const hoursLeft = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return hoursLeft > 0 ? `${days}d ${hoursLeft}h` : `${days}d`;
  }

  if (hoursLeft > 0 && minutes > 0) return `${hoursLeft}h ${minutes}m`;
  if (hoursLeft > 0) return `${hoursLeft}h`;

  return `${minutes}m`;
}

export function toWorkHistoryEntry(
  summary: ClaimSummary,
  details: ClaimDetails | null,
  adjusterId: string,
): AdjusterWorkHistoryEntry {
  const base: AdjusterWorkHistoryEntry = {
    claimId: summary.id,
    claimNumber: summary.claimNumber,
    status: summary.status,
    customerName: summary.customerName,
    plateNumber: summary.initialPlateNumber || null,
    inspectionCount: null,
    evidenceCount: null,
    completedAt: null,
    durationHours: null,
  };

  if (!details) return base;

  const completedAt = resolveCompletedAt(details);

  return {
    ...base,
    inspectionCount: countInspections(details.timeline, adjusterId),
    evidenceCount: Array.isArray(details.evidence)
      ? details.evidence.length
      : null,
    completedAt,
    durationHours: computeDurationHours(
      details.assignment?.assignedAt,
      completedAt,
    ),
  };
}

export interface WorkHistoryTotals {
  completedCount: number;
  // null when at least one hydrated entry has no details, so the total cannot
  // be trusted — the UI shows "—" rather than a wrong number.
  totalInspections: number | null;
  averageDurationHours: number | null;
  lastCompletedAt: string | null;
}

export function summarizeWorkHistory(
  entries: AdjusterWorkHistoryEntry[],
  totalCompleted: number,
): WorkHistoryTotals {
  const durations = entries
    .map((entry) => entry.durationHours)
    .filter((hours): hours is number => hours !== null);

  const completeEntries = entries.filter(
    (entry) => entry.inspectionCount !== null,
  );

  const totalInspections = completeEntries.length
    ? completeEntries.reduce(
        (sum, entry) => sum + (entry.inspectionCount ?? 0),
        0,
      )
    : null;

  const lastCompletedAt = entries
    .map((entry) => timeOf(entry.completedAt))
    .filter((time) => time > 0)
    .sort((a, b) => b - a)[0];

  return {
    completedCount: totalCompleted,
    totalInspections:
      totalInspections === null || completeEntries.length < entries.length
        ? null
        : totalInspections,
    averageDurationHours: durations.length
      ? durations.reduce((sum, hours) => sum + hours, 0) / durations.length
      : null,
    lastCompletedAt: lastCompletedAt
      ? new Date(lastCompletedAt).toISOString()
      : null,
  };
}
