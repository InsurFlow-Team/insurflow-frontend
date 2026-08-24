import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
}

export default function Input({
  error,
  icon,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={`
          w-full rounded-lg border bg-background text-sm text-text
          px-4 py-2.5 placeholder:text-text-muted/50
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          transition duration-150
          ${error ? "border-danger focus:ring-danger/40 focus:border-danger" : "border-border"}
          ${icon ? "pl-9" : ""}
          ${className}
        `}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
