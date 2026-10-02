import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export default function Textarea({
  error,
  className = "",
  ...props
}: TextareaProps) {
  const baseStyles =
    "w-full rounded-lg border bg-surface-primary px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 transition-colors";

  const errorStyles = error
    ? "border-danger focus:ring-danger/20"
    : "border-border focus:border-primary focus:ring-primary/20";

  return (
    <textarea
      className={`${baseStyles} ${errorStyles} ${className}`}
      {...props}
    />
  );
}
