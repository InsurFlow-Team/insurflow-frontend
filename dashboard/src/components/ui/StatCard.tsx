import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  secondary: string;
  icon: LucideIcon;
  iconClass: string;
  dot?: string;
}

export default function StatCard({
  label,
  value,
  secondary,
  icon: Icon,
  iconClass,
  dot,
}: StatCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </span>
        <Icon size={18} className={`shrink-0 ${iconClass}`} />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <strong className="text-3xl font-bold text-text">{value}</strong>
        {dot && (
          <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
        )}
      </div>

      <p className="mt-1 text-xs text-text-muted">{secondary}</p>
    </article>
  );
}