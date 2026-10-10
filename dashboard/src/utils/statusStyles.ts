import type {
  UserStatus,
  ClaimStatus,
  InspectionTaskStatus,
  Availability,
} from "../types";
import { toneClass, toneClasses, type Tone } from "./toneStyles";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleDot,
  ClipboardCheck,
  FileSearch,
  FileText,
  Gavel,
  Hourglass,
  Loader,
  PauseCircle,
  UserCheck,
  UserPlus,
  XCircle,
} from "lucide-react";

/**
 * The single source of truth for how a status is labelled, coloured, and
 * iconified across the entire platform.
 *
 * This table drives:
 *   • StatusBadge            — badge in tables, cards, headers
 *   • claimStatCards         — dashboard metric cards
 *   • Any component that calls statusStyle() / statusClasses()
 *
 * A status MUST be added here before it can be displayed anywhere.
 * statusStyle() falls back to the `neutral` tone rather than rendering blank.
 *
 * ── Icon guidance ──────────────────────────────────────────────────────────
 * Every status carries an icon. The icon gives the badge a second signal
 * channel beyond colour, which is required for accessibility (WCAG 1.4.1).
 * Use the smallest meaningful icon from lucide-react (16px render target).
 */
export type AnyStatus =
  | UserStatus
  | ClaimStatus
  | InspectionTaskStatus
  | Availability
  // Extended product-lifecycle stages (not yet in ClaimStatus type, used for
  // display and documentation purposes — do not block on backend availability)
  | "READY_FOR_ASSIGNMENT"
  | "INSPECTION_IN_PROGRESS"
  | "REPORT_SUBMITTED"
  | "UNDER_DECISION"
  | "ON_HOLD"
  | "CANCELLED"
  | "OVERDUE";

export interface StatusStyle {
  /** English fallback label (screens override with translated label). */
  label: string;
  tone: Tone;
  /**
   * Lucide icon component. Every status must have one — it is the second
   * signal channel (colour alone is not enough).
   */
  icon: LucideIcon;
  /**
   * Optional filled dot for statuses that read better with a state marker
   * (e.g. ACTIVE, AVAILABLE). When set, the badge renders a dot instead of
   * the icon so both channels coexist without visual clutter.
   */
  dot?: string;
}

export const statusStyles: Record<AnyStatus, StatusStyle> = {
  // ── User ──────────────────────────────────────────────────────────────────
  ACTIVE: {
    label: "Active",
    tone: "success",
    icon: CheckCircle2,
    dot: toneClass("success", "solid"),
  },
  INACTIVE: {
    label: "Inactive",
    tone: "neutral",
    icon: Circle,
    dot: toneClass("neutral", "solid"),
  },

  // ── Availability ──────────────────────────────────────────────────────────
  AVAILABLE: {
    label: "Available",
    tone: "success",
    icon: CheckCircle2,
    dot: toneClass("success", "solid"),
  },
  UNAVAILABLE: {
    label: "Unavailable",
    tone: "danger",
    icon: XCircle,
    dot: toneClass("danger", "solid"),
  },

  // ── Claim lifecycle ───────────────────────────────────────────────────────

  /** Claim just submitted, no action taken yet. */
  NEW: {
    label: "New",
    tone: "neutral",
    icon: CircleDashed,
  },

  /** Adjuster assigned, awaiting their acceptance. */
  PENDING_ACCEPTANCE: {
    label: "Awaiting Reply",
    tone: "info",
    icon: Hourglass,
  },

  /** Adjuster has been assigned (pre-acceptance). */
  ASSIGNED: {
    label: "Assigned",
    tone: "violet",
    icon: UserCheck,
  },

  /** Adjuster accepted and inspection is underway. */
  IN_PROGRESS: {
    label: "In Progress",
    tone: "warning",
    icon: Loader,
  },

  /** Inspection report submitted, awaiting officer review. */
  SUBMITTED: {
    label: "Submitted",
    tone: "info",
    icon: FileText,
  },

  /** Officer is actively reviewing the report. */
  UNDER_REVIEW: {
    label: "Under Review",
    tone: "warning",
    icon: FileSearch,
  },

  /** Officer returned the report for correction. */
  CORRECTION_REQUIRED: {
    label: "Correction Required",
    tone: "rose",
    icon: AlertCircle,
  },

  /** Claim approved — payment/repair authorised. */
  APPROVED: {
    label: "Approved",
    tone: "success",
    icon: CheckCircle2,
  },

  /** Claim rejected — coverage denied. */
  REJECTED: {
    label: "Rejected",
    tone: "danger",
    icon: XCircle,
  },

  /** Claim fully resolved and closed. */
  CLOSED: {
    label: "Closed",
    tone: "neutral",
    icon: CircleDot,
  },

  // ── Extended product-lifecycle stages ─────────────────────────────────────
  // These match the design brief's full 14-status list and the product
  // architecture stages (docs/ARCHITECTURE-PRODUCT). They are displayed in
  // the UI today; backend may use composite state to derive them.

  /** Intake complete, ready to be assigned to an adjuster. */
  READY_FOR_ASSIGNMENT: {
    label: "Ready for Assignment",
    tone: "info",
    icon: UserPlus,
  },

  /** Adjuster is actively performing the physical inspection. */
  INSPECTION_IN_PROGRESS: {
    label: "Inspection in Progress",
    tone: "warning",
    icon: ClipboardCheck,
  },

  /** Adjuster has filed the full inspection report. */
  REPORT_SUBMITTED: {
    label: "Report Submitted",
    tone: "info",
    icon: FileText,
  },

  /** Claims officer / admin is making the coverage decision. */
  UNDER_DECISION: {
    label: "Under Decision",
    tone: "warning",
    icon: Gavel,
  },

  /** Claim processing paused (waiting for external information). */
  ON_HOLD: {
    label: "On Hold",
    tone: "neutral",
    icon: PauseCircle,
  },

  /** Claim withdrawn by customer or voided by admin. */
  CANCELLED: {
    label: "Cancelled",
    tone: "neutral",
    icon: Ban,
  },

  /** SLA deadline exceeded — time-sensitive attention required. */
  OVERDUE: {
    label: "Overdue",
    tone: "danger",
    icon: AlertTriangle,
  },
};

const UNKNOWN: StatusStyle = {
  label: "Unknown",
  tone: "neutral",
  icon: Circle,
};

export function statusStyle(status: string): StatusStyle {
  return statusStyles[status as AnyStatus] ?? UNKNOWN;
}

/** Tailwind class string: `bg-* border-* text-*` for a status. */
export function statusClasses(status: string): string {
  return toneClasses(statusStyle(status).tone);
}

export function statusDotClass(status: string): string | undefined {
  return statusStyle(status).dot;
}
