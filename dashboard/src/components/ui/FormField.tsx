import type { ReactNode } from "react";
import { useId } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  /** Short helper text rendered below the label */
  description?: string;
  /** Validation error message — renders in danger colour with role="alert" */
  error?: string;
  /** Show a success tick after the field (e.g. async validation passed) */
  success?: boolean;
  /** Replaces the label with a skeleton while the form is hydrating */
  loading?: boolean;
  children: ReactNode;
  /** Extra wrapper class */
  className?: string;
}

// ─── FormField ────────────────────────────────────────────────────────────────

/**
 * FormField
 *
 * Wraps a single form control with a consistent label, optional description,
 * validation error, and success state. The `children` should be an
 * `<Input>`, `<Select>`, or `<Textarea>` — the field does not care which.
 *
 * Accessibility:
 *   • The label is always a `<label>` — not a `<div>` — so clicking it
 *     focuses the control.
 *   • The error is `role="alert"` so screen readers announce it on change.
 *   • The description has a stable id connected to the control via
 *     `aria-describedby` when forwarded (see Input/Select/Textarea).
 *   • Required fields get both the visual `*` marker and aria-required on
 *     the child control (the child must forward the `required` prop).
 *
 * RTL:
 *   • Uses `me-` (margin-end) for the required asterisk so it tracks
 *     the correct side in both LTR and RTL.
 *
 * Usage:
 *   <FormField label="Adjuster" required error={errors.adjuster}>
 *     <Select ... />
 *   </FormField>
 *
 *   <FormField label="Notes" description="Optional — visible to the officer only">
 *     <Textarea ... />
 *   </FormField>
 */
export default function FormField({
  label,
  htmlFor,
  required = false,
  description,
  error,
  loading = false,
  className = "",
  children,
}: FormFieldProps) {
  const descId = useId();
  const errorId = useId();

  if (loading) {
    return (
      <div className={`space-y-1.5 ${className}`} aria-hidden="true">
        <div className="skeleton h-3.5 w-24 rounded" />
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label row */}
      <div className="flex items-baseline gap-1.5">
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-text leading-none"
        >
          {label}
          {required && (
            <span
              className="ms-0.5 text-danger"
              aria-hidden="true"
              title="Required"
            >
              *
            </span>
          )}
        </label>
        {description && (
          <span
            id={descId}
            className="text-xs text-text-muted leading-none"
          >
            {description}
          </span>
        )}
      </div>

      {/* Control slot */}
      {children}

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="flex items-center gap-1 text-xs text-danger-text leading-snug"
        >
          <span aria-hidden="true">↳</span>
          {error}
        </p>
      )}
    </div>
  );
}
