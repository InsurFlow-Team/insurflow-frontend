import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  /** Placeholder option rendered at position 0, value="" */
  placeholder?: string;
  /** Validation error — adds danger border + ring */
  error?: string;
}

// ─── Base classes ─────────────────────────────────────────────────────────────

const BASE =
  "w-full appearance-none rounded-lg border bg-background text-sm text-text " +
  "ps-4 pe-9 py-2.5 " +
  "transition-colors duration-150 " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

const BORDER_NORMAL = "border-border hover:border-primary/40";
const BORDER_ERROR = "border-danger focus-visible:ring-danger/30 focus-visible:border-danger";

// ─── Select ───────────────────────────────────────────────────────────────────

/**
 * Select
 *
 * Styled native `<select>`. Always pair with `<FormField>` for labels and
 * error messages.
 *
 * RTL: `ps-` / `pe-` ensure the chevron sits on the correct end and the
 * text starts on the correct side in both LTR and RTL layouts.
 *
 * Usage:
 *   <FormField label="Priority" required error={errors.priority}>
 *     <Select
 *       value={priority}
 *       onChange={(e) => setPriority(e.target.value)}
 *       placeholder="Select priority"
 *       options={[
 *         { value: "LOW", label: "Low" },
 *         { value: "HIGH", label: "High" },
 *       ]}
 *     />
 *   </FormField>
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, className = "", ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          className={[
            BASE,
            error ? BORDER_ERROR : BORDER_NORMAL,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron — sits at the logical end so it is correct in RTL */}
        <ChevronDown
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
