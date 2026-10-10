import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Validation error — adds danger border + ring */
  error?: string;
  /** Character counter displayed in the bottom-right corner */
  maxLength?: number;
}

// ─── Base classes ─────────────────────────────────────────────────────────────

const BASE =
  "w-full rounded-lg border bg-background text-sm text-text " +
  "px-4 py-2.5 placeholder:text-text-muted/60 " +
  "resize-y min-h-[80px] " +
  "transition-colors duration-150 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary " +
  "disabled:opacity-50 disabled:cursor-not-allowed " +
  "read-only:bg-surface-sunken read-only:text-text-muted";

const BORDER_NORMAL = "border-border hover:border-primary/40";
const BORDER_ERROR = "border-danger focus-visible:ring-danger/30 focus-visible:border-danger";

// ─── Textarea ─────────────────────────────────────────────────────────────────

/**
 * Textarea
 *
 * Multi-line text input. Always pair with `<FormField>` for labels and errors.
 * When `maxLength` is provided, renders a live character counter in the
 * bottom-right corner of the wrapper.
 *
 * Usage:
 *   <FormField label="Notes" description="Visible to claims officers only">
 *     <Textarea
 *       value={notes}
 *       onChange={(e) => setNotes(e.target.value)}
 *       maxLength={500}
 *       rows={4}
 *     />
 *   </FormField>
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, maxLength, className = "", value, ...props }, ref) => {
    const currentLength =
      typeof value === "string" ? value.length : 0;
    const nearLimit =
      maxLength !== undefined && currentLength >= maxLength * 0.85;

    return (
      <div className="relative">
        <textarea
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          maxLength={maxLength}
          value={value}
          className={[
            BASE,
            error ? BORDER_ERROR : BORDER_NORMAL,
            maxLength ? "pb-6" : "", // room for the counter
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {/* Character counter */}
        {maxLength !== undefined && (
          <span
            aria-live="polite"
            className={[
              "pointer-events-none absolute end-2.5 bottom-2 text-[11px] tabular-nums",
              nearLimit ? "text-warning-text" : "text-text-subtle",
            ].join(" ")}
          >
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
export default Textarea;
