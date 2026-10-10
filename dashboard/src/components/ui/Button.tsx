import React from "react";
import { Loader2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "destructive"
  | "ghost"
  | "link";

export type ButtonSize = "sm" | "md" | "lg";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /**
   * Leading icon rendered before the label (hidden while loading).
   * For a button that has only an icon and no label text, use `IconButton`
   * instead — it has the correct square sizing and aria-label requirements.
   */
  icon?: React.ReactNode;
}

export interface ButtonProps
  extends BaseButtonProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {}

// ─── Style maps ───────────────────────────────────────────────────────────────

const variantBase: Record<ButtonVariant, string> = {
  primary: [
    "bg-primary text-white border-transparent",
    "hover:bg-primary-dark",
    "active:bg-primary-dark",
    "disabled:bg-primary/60",
  ].join(" "),

  secondary: [
    "bg-surface text-text border-border",
    "hover:bg-background hover:border-primary/30",
    "active:bg-background",
    "disabled:bg-surface/60 disabled:text-text-muted",
  ].join(" "),

  destructive: [
    "bg-danger text-white border-transparent",
    "hover:bg-danger-text",
    "active:bg-danger-text",
    "disabled:bg-danger/60",
    "focus-visible:ring-danger/30",
  ].join(" "),

  ghost: [
    "bg-transparent text-text-muted border-transparent",
    "hover:bg-background hover:text-text",
    "active:bg-background",
    "disabled:opacity-40",
  ].join(" "),

  link: [
    "bg-transparent text-primary border-transparent underline-offset-4",
    "hover:underline hover:text-primary-dark",
    "active:text-primary-dark",
    "disabled:opacity-40",
    "px-0 py-0 h-auto rounded-none gap-1",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8  px-3   text-xs  gap-1.5",
  md: "h-9  px-4   text-sm  gap-2",
  lg: "h-11 px-5   text-sm  gap-2",
};

// The `link` variant overrides padding/height above, so skip size for it.
const LINK_VARIANT = "link";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Primary interactive element.
 *
 * Usage:
 *   <Button>Save</Button>
 *   <Button variant="secondary" icon={<Plus size={14} />}>Add claim</Button>
 *   <Button variant="destructive" loading={submitting}>Delete</Button>
 *   <Button variant="link" onClick={handleClick}>View details</Button>
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const isLink = variant === LINK_VARIANT;

  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        // Base
        "inline-flex items-center justify-center font-medium rounded-lg border",
        "transition-colors duration-150 cursor-pointer",
        "select-none whitespace-nowrap",
        // Focus ring
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1",
        // Disabled
        "disabled:cursor-not-allowed",
        // Variant
        variantBase[variant],
        // Size (skip for link — it overrides its own sizing)
        !isLink ? sizeClasses[size] : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <Loader2
            size={size === "lg" ? 16 : 14}
            className="animate-spin shrink-0"
            aria-hidden="true"
          />
          {/* Keep label visible while loading so width stays stable */}
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && (
            <span className="shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          {children}
        </>
      )}
    </button>
  );
}

// ─── IconButton ───────────────────────────────────────────────────────────────

type IconButtonSize = "sm" | "md" | "lg";

const iconSizeClasses: Record<IconButtonSize, string> = {
  sm: "h-7 w-7 text-sm",
  md: "h-9 w-9 text-base",
  lg: "h-11 w-11 text-lg",
};

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Must be provided for accessibility. */
  "aria-label": string;
  icon: React.ReactNode;
  variant?: Exclude<ButtonVariant, "link">;
  size?: IconButtonSize;
  loading?: boolean;
}

/**
 * Square icon-only button. Always requires `aria-label`.
 *
 * Usage:
 *   <IconButton aria-label="Close" icon={<X size={16} />} variant="ghost" />
 */
export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[
        "inline-flex items-center justify-center rounded-lg border",
        "transition-colors duration-150 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variantBase[variant],
        iconSizeClasses[size],
        // Override padding from variantBase (icon button is square)
        "p-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <Loader2
          size={size === "lg" ? 18 : size === "sm" ? 12 : 15}
          className="animate-spin"
          aria-hidden="true"
        />
      ) : (
        <span aria-hidden="true">{icon}</span>
      )}
    </button>
  );
}
