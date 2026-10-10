import { CheckCircle2 } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Validation error — adds danger border + ring */
  error?: string;
  /** Leading icon (left / start side) */
  icon?: ReactNode;
  /** Trailing element — use for units, clear buttons, etc. */
  trailingElement?: ReactNode;
  /** Renders a green check after successful async validation */
  success?: boolean;
}

// ─── Base classes ─────────────────────────────────────────────────────────────

const BASE =
  "w-full rounded-lg border bg-background text-sm text-text " +
  "px-4 py-2.5 placeholder:text-text-muted/60 " +
  "transition-colors duration-150 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "read-only:bg-surface-sunken read-only:text-text-muted";

const BORDER_NORMAL = "border-border hover:border-primary/40";
const BORDER_ERROR = "border-danger focus-visible:ring-danger/30 focus-visible:border-danger";

// ─── Input ────────────────────────────────────────────────────────────────────

/**
 * Input
 *
 * Base text input. Always pair with `<FormField>` for labels, errors, and
 * descriptions. Supports leading icon, trailing element (units/buttons),
 * error state, and success indicator.
 *
 * RTL: uses `ps-` / `pe-` (padding-start / padding-end) so icons stay on
 * the correct side in both LTR and RTL layouts.
 *
 * Usage:
 *   <FormField label="Plate number" required error={errors.plate}>
 *     <Input
 *       value={plate}
 *       onChange={(e) => setPlate(e.target.value)}
 *       icon={<Car size={15} />}
 *       placeholder="ABC-1234"
 *     />
 *   </FormField>
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { error, icon, trailingElement, success, className = "", ...props },
    ref,
  ) => {
    const hasLeading = Boolean(icon);
    const hasTrailing = Boolean(trailingElement) || success;

    return (
      <div className="relative flex items-center">
        {/* Leading icon */}
        {icon && (
          <span
            className="pointer-events-none absolute start-3 text-text-muted"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          className={[
            BASE,
            error ? BORDER_ERROR : BORDER_NORMAL,
            hasLeading ? "ps-9" : "",
            hasTrailing ? "pe-9" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {/* Trailing: success icon or custom element */}
        {success && !trailingElement && (
          <span
            className="pointer-events-none absolute end-3 text-success-strong"
            aria-hidden="true"
          >
            <CheckCircle2 size={15} />
          </span>
        )}
        {trailingElement && (
          <span className="absolute end-3">{trailingElement}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
