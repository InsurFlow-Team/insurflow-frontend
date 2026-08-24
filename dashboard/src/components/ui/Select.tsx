import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export default function Select({
  options,
  placeholder,
  error,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className={`
          w-full rounded-lg border bg-background text-sm text-text
          px-4 py-2.5 pr-9 appearance-none
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
          disabled:opacity-50 disabled:cursor-not-allowed
          transition duration-150
          ${error ? "border-danger focus:ring-danger/40 focus:border-danger" : "border-border"}
          ${className}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />

      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
