import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertVariant = "info" | "success" | "warning" | "danger";

export interface AlertCardProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  /** When provided, renders a dismiss button in the top-right corner. */
  onDismiss?: () => void;
  /** Visually condense the alert to a single line (no title slot). */
  compact?: boolean;
  className?: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

interface VariantStyle {
  wrapper: string;
  icon: typeof Info;
  iconClass: string;
  titleClass: string;
  bodyClass: string;
  dismissClass: string;
  /** ARIA role: "alert" interrupts, "status" is polite */
  role: "alert" | "status";
}

const VARIANT_STYLES: Record<AlertVariant, VariantStyle> = {
  info: {
    wrapper: "bg-info-bg border-info-border",
    icon: Info,
    iconClass: "text-info",
    titleClass: "text-info-deep",
    bodyClass: "text-info-text",
    dismissClass:
      "text-info-muted hover:text-info-deep hover:bg-info-soft",
    role: "status",
  },
  success: {
    wrapper: "bg-success-bg border-success-border",
    icon: CheckCircle2,
    iconClass: "text-success-strong",
    titleClass: "text-success-deep",
    bodyClass: "text-success-text",
    dismissClass:
      "text-success-strong hover:text-success-deep hover:bg-success-soft",
    role: "status",
  },
  warning: {
    wrapper: "bg-warning-bg border-warning-border",
    icon: AlertTriangle,
    iconClass: "text-warning",
    titleClass: "text-warning-deep",
    bodyClass: "text-warning-text",
    dismissClass:
      "text-warning-muted hover:text-warning-deep hover:bg-amber-100",
    role: "alert",
  },
  danger: {
    wrapper: "bg-danger-bg border-danger-border",
    icon: AlertCircle,
    iconClass: "text-danger",
    titleClass: "text-danger-text",
    bodyClass: "text-danger-text",
    dismissClass: "text-danger hover:text-danger-text hover:bg-rose-100",
    role: "alert",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AlertCard
 *
 * Inline contextual feedback for a page section or form. Use for banners,
 * callouts, and validation summaries — not for toast notifications.
 *
 * Variants:
 *   info     → blue  — informational, non-blocking
 *   success  → green — confirmation, operation completed
 *   warning  → amber — soft warning, user should take note
 *   danger   → red   — hard error, action blocked or data at risk
 *
 * Accessibility:
 *   • `role="alert"` on warning/danger (assertive, interrupts screen readers)
 *   • `role="status"` on info/success (polite, does not interrupt)
 *   • Icon is aria-hidden; meaning is carried by the text
 *   • Dismiss button has an aria-label
 *
 * Usage:
 *   <AlertCard variant="warning" title="SLA breach risk">
 *     This claim has been in review for 2 days without a decision.
 *   </AlertCard>
 *
 *   <AlertCard variant="danger" onDismiss={() => setError(null)}>
 *     {error}
 *   </AlertCard>
 *
 *   <AlertCard variant="success" compact>Assignment sent to adjuster.</AlertCard>
 */
export default function AlertCard({
  variant = "info",
  title,
  children,
  onDismiss,
  compact = false,
  className = "",
}: AlertCardProps) {
  const style = VARIANT_STYLES[variant];
  const Icon = style.icon;

  if (compact) {
    return (
      <div
        role={style.role}
        className={[
          "flex items-center gap-2.5 rounded-lg border px-3 py-2.5",
          style.wrapper,
          className,
        ].join(" ")}
      >
        <Icon
          size={15}
          aria-hidden="true"
          className={`shrink-0 ${style.iconClass}`}
        />
        <p className={`text-sm leading-snug flex-1 ${style.bodyClass}`}>
          {children}
        </p>
        {onDismiss && (
          <DismissButton onDismiss={onDismiss} className={style.dismissClass} />
        )}
      </div>
    );
  }

  return (
    <div
      role={style.role}
      className={[
        "rounded-lg border p-4",
        style.wrapper,
        className,
      ].join(" ")}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <Icon
          size={18}
          aria-hidden="true"
          className={`shrink-0 mt-0.5 ${style.iconClass}`}
        />

        {/* Body */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className={`text-sm font-semibold leading-snug ${style.titleClass}`}>
              {title}
            </p>
          )}
          <div
            className={[
              "text-sm leading-relaxed",
              title ? "mt-1" : "",
              style.bodyClass,
            ].join(" ")}
          >
            {children}
          </div>
        </div>

        {/* Dismiss */}
        {onDismiss && (
          <div className="shrink-0">
            <DismissButton
              onDismiss={onDismiss}
              className={style.dismissClass}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Dismiss button ───────────────────────────────────────────────────────────

function DismissButton({
  onDismiss,
  className,
}: {
  onDismiss: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Dismiss"
      className={[
        "rounded p-0.5 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        className,
      ].join(" ")}
    >
      <X size={14} aria-hidden="true" />
    </button>
  );
}
