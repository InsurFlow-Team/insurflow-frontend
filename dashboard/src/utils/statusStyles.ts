import type {
  UserStatus,
  ClaimStatus,
  InspectionTaskStatus,
  Availability,
} from "../types";
import { toneClass, toneClasses, type Tone } from "./toneStyles";

/**
 * The single source of truth for how a status is labelled and coloured.
 *
 * This table also drives the dashboard status cards (via `claimStatCards`),
 * so a status can never be described one way in the cards and another in
 * its badge. `StatusBadge` renders straight from here.
 *
 * A status must be added to this table before it can be displayed anywhere —
 * `statusStyle` falls back to the neutral tone rather than rendering blank.
 */
export type AnyStatus = UserStatus | ClaimStatus | InspectionTaskStatus | Availability;

export interface StatusStyle {
  label: string;
  tone: Tone;
  /** A filled dot, for statuses that read better with a state marker. */
  dot?: string;
}

export const statusStyles: Record<AnyStatus, StatusStyle> = {
  // --- User -------------------------------------------------------------
  ACTIVE: { label: "Active", tone: "success", dot: toneClass("success", "solid") },
  INACTIVE: { label: "Inactive", tone: "neutral", dot: toneClass("neutral", "solid") },

  // --- Claim lifecycle --------------------------------------------------
  NEW: { label: "New", tone: "neutral" },
  PENDING_ACCEPTANCE: { label: "Awaiting Reply", tone: "info" },
  ASSIGNED: { label: "Assigned", tone: "violet" },
  IN_PROGRESS: { label: "In Progress", tone: "warning" },
  SUBMITTED: { label: "Submitted", tone: "info" },
  UNDER_REVIEW: { label: "Under Review", tone: "warning" },
  CORRECTION_REQUIRED: { label: "Correction Required", tone: "rose" },
  APPROVED: { label: "Approved", tone: "success" },
  REJECTED: { label: "Rejected", tone: "danger" },
  CLOSED: { label: "Closed", tone: "neutral" },

  // --- Inspection task --------------------------------------------------
  // `InspectionTaskStatus` is a subset of the claim statuses above
  // ("ASSIGNED" | "IN_PROGRESS" | "SUBMITTED"), so a task reuses the claim
  // entry rather than needing its own colour.

  // --- Availability -----------------------------------------------------
  AVAILABLE: { label: "Available", tone: "success", dot: toneClass("success", "solid") },
  UNAVAILABLE: { label: "Unavailable", tone: "danger", dot: toneClass("danger", "solid") },
};

const UNKNOWN: StatusStyle = { label: "Unknown", tone: "neutral" };

export function statusStyle(status: string): StatusStyle {
  return statusStyles[status as AnyStatus] ?? UNKNOWN;
}

/** Badge class list for a status: surface + outline + readable label. */
export function statusClasses(status: string): string {
  return toneClasses(statusStyle(status).tone);
}

export function statusDotClass(status: string): string | undefined {
  return statusStyle(status).dot;
}
