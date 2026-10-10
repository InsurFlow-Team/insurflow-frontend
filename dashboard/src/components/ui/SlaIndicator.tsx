import { AlertTriangle, Clock, Timer } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SlaState = "normal" | "warning" | "overdue";

/**
 * Pre-computed SLA display data.
 *
 * Pass these props when a parent already knows the deadline; use the
 * `fromDeadline` helper when you only have an ISO deadline string.
 */
export interface SlaIndicatorProps {
  /**
   * Minutes remaining (positive) or overdue (negative).
   * The component derives `state` automatically when this is provided
   * and `state` is omitted.
   *
   * Override with `state` when the parent wants explicit control
   * (e.g. a backend-supplied SLA state string).
   */
  minutesRemaining: number;
  /**
   * Explicit state override.  If omitted, the component derives state from
   * `minutesRemaining`:
   *   < 0              → "overdue"
   *   0 – 30 mins      → "warning"
   *   > 30 mins        → "normal"
   */
  state?: SlaState;
  /** Render as a compact inline chip rather than a full row. */
  compact?: boolean;
  /** Additional wrapper className. */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const WARNING_THRESHOLD_MINUTES = 30;

export function deriveState(minutesRemaining: number): SlaState {
  if (minutesRemaining < 0) return "overdue";
  if (minutesRemaining <= WARNING_THRESHOLD_MINUTES) return "warning";
  return "normal";
}

/**
 * Format a signed minute count into a human-readable duration.
 *
 * Examples:
 *   formatDuration(134)   → "2h 14m"
 *   formatDuration(18)    → "18m"
 *   formatDuration(-18)   → "18m"   (sign is expressed in the label)
 *   formatDuration(0)     → "0m"
 *   formatDuration(1440)  → "1d"
 *   formatDuration(1500)  → "1d 1h"
 */
export function formatDuration(minutes: number): string {
  const abs = Math.abs(minutes);

  const days = Math.floor(abs / (60 * 24));
  const hours = Math.floor((abs % (60 * 24)) / 60);
  const mins = abs % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);

  return parts.join(" ");
}

/**
 * Given a deadline ISO string, compute the `minutesRemaining` value to pass
 * into `SlaIndicator`.
 *
 * Usage in a component:
 *   const minutes = minutesUntilDeadline(claim.slaDeadline);
 *   <SlaIndicator minutesRemaining={minutes} />
 */
export function minutesUntilDeadline(
  deadlineIso: string,
  now: number = Date.now(),
): number {
  const deadline = Date.parse(deadlineIso);
  if (Number.isNaN(deadline)) return 0;
  return Math.round((deadline - now) / 60_000);
}

// ─── Style maps ───────────────────────────────────────────────────────────────

interface StateStyle {
  icon: typeof Clock;
  /** Wrapper background + border (for the pill/row form) */
  container: string;
  /** Icon colour */
  iconClass: string;
  /** Label colour */
  textClass: string;
  /** Accessible prefix announced by screen readers */
  srPrefix: string;
}

const STATE_STYLES: Record<SlaState, StateStyle> = {
  normal: {
    icon: Clock,
    container: "bg-surface border-border",
    iconClass: "text-text-muted",
    textClass: "text-text-muted",
    srPrefix: "SLA:",
  },
  warning: {
    icon: Timer,
    container: "bg-warning-bg border-warning-border",
    iconClass: "text-warning",
    textClass: "text-warning-text",
    srPrefix: "SLA warning:",
  },
  overdue: {
    icon: AlertTriangle,
    container: "bg-danger-bg border-danger-border",
    iconClass: "text-danger",
    textClass: "text-danger-text",
    srPrefix: "SLA overdue:",
  },
};

// ─── Label builders ───────────────────────────────────────────────────────────

function buildLabel(state: SlaState, minutesRemaining: number): string {
  const duration = formatDuration(minutesRemaining);
  switch (state) {
    case "normal":
    case "warning":
      return `${duration} remaining`;
    case "overdue":
      return `${duration} overdue`;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SlaIndicator
 *
 * Displays a claim's SLA status in a consistently-styled chip.
 * Reusable across Overview, Claims table, Claim Details, Assignments, and
 * the Field Adjuster dashboard.
 *
 * States:
 *   normal  "2h 14m remaining"  — grey, Clock icon
 *   warning "18m remaining"     — amber, Timer icon
 *   overdue "18m overdue"       — red,   AlertTriangle icon
 *
 * Accessibility:
 *   • role="status" so screen readers announce changes.
 *   • A visually-hidden prefix ("SLA warning:") precedes the label so the
 *     announcement is meaningful out of context.
 *   • Does not rely on colour alone: icon shape changes per state.
 *
 * Usage:
 *   // With a pre-computed minute count:
 *   <SlaIndicator minutesRemaining={134} />
 *
 *   // From a deadline ISO string:
 *   <SlaIndicator minutesRemaining={minutesUntilDeadline(claim.slaDeadline)} />
 *
 *   // Compact inline chip:
 *   <SlaIndicator minutesRemaining={-18} compact />
 *
 *   // Explicit state override (e.g. from backend):
 *   <SlaIndicator minutesRemaining={18} state="warning" />
 */
export default function SlaIndicator({
  minutesRemaining,
  state: stateProp,
  compact = false,
  className = "",
}: SlaIndicatorProps) {
  const state = stateProp ?? deriveState(minutesRemaining);
  const style = STATE_STYLES[state];
  const Icon = style.icon;
  const label = buildLabel(state, minutesRemaining);

  if (compact) {
    // ── Compact chip ──────────────────────────────────────────────────────
    return (
      <span
        role="status"
        className={[
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
          "text-[11px] font-semibold",
          style.container,
          className,
        ].join(" ")}
      >
        <Icon size={11} className={`shrink-0 ${style.iconClass}`} aria-hidden="true" />
        <span className={style.textClass}>
          <span className="sr-only">{style.srPrefix} </span>
          {label}
        </span>
      </span>
    );
  }

  // ── Full row ─────────────────────────────────────────────────────────────
  return (
    <div
      role="status"
      className={[
        "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5",
        "text-sm",
        style.container,
        className,
      ].join(" ")}
    >
      <Icon size={14} className={`shrink-0 ${style.iconClass}`} aria-hidden="true" />
      <span className={`font-medium ${style.textClass}`}>
        <span className="sr-only">{style.srPrefix} </span>
        {label}
      </span>
    </div>
  );
}
