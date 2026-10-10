import { statusStyle, statusClasses } from "../../utils/statusStyles";

interface StatusBadgeProps {
  /**
   * A `ClaimStatus`, `UserStatus`, `InspectionTaskStatus`, `Availability`, or
   * any extended product-lifecycle stage string defined in statusStyles.
   */
  status: string;
  /**
   * Translated label override. Bilingual screens pass `t("claimStatus.X")`
   * here so the badge always shows the UI locale, while the fallback English
   * label in statusStyles is still used for screen-readers when no override
   * is given.
   */
  label?: string;
  /**
   * `"badge"` (default) — compact pill for tables and cards.
   * `"pill"`            — slightly taller, used in headers and detail views.
   */
  size?: "badge" | "pill";
}

/**
 * StatusBadge
 *
 * Communicates status through three independent channels:
 *   1. Colour family  — tone (success/warning/danger/info/neutral/…)
 *   2. Icon           — unique per-status shape from lucide-react
 *   3. Label text     — always visible, never truncated
 *
 * This means the component passes WCAG 1.4.1 (Use of Colour) without
 * relying solely on hue to convey information.
 *
 * Accessibility:
 *   • role="status" + aria-label so screen readers announce the full value.
 *   • The icon is aria-hidden — it is decorative; the label carries meaning.
 *   • The dot (user/availability statuses) is also aria-hidden.
 */
export default function StatusBadge({
  status,
  label,
  size = "badge",
}: StatusBadgeProps) {
  const style = statusStyle(status);
  const Icon = style.icon;

  const displayLabel = label ?? style.label;

  const sizeClasses =
    size === "pill"
      ? "px-3 py-1 text-xs gap-1.5 rounded-full"
      : "px-2.5 py-0.5 text-[11px] gap-1 rounded-full";

  return (
    <span
      role="status"
      aria-label={displayLabel}
      className={[
        "inline-flex items-center font-semibold border",
        sizeClasses,
        statusClasses(status),
      ].join(" ")}
    >
      {style.dot ? (
        /* Dot-style badges (ACTIVE / AVAILABLE / etc.) */
        <span
          className={`shrink-0 inline-block h-1.5 w-1.5 rounded-full ${style.dot}`}
          aria-hidden="true"
        />
      ) : (
        /* Icon-style badges — every other status */
        <Icon
          size={size === "pill" ? 12 : 11}
          aria-hidden="true"
          className="shrink-0"
        />
      )}
      {displayLabel}
    </span>
  );
}
