import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StatCardTrend = "up" | "down" | "neutral";

export interface StatCardProps {
  /** Short label, e.g. "Total Claims" */
  label: string;
  /** Primary numeric value */
  value: number | string;
  /** Supporting line below the value, e.g. "Awaiting assignment" */
  secondary?: string;
  /** Leading icon rendered in the top-right corner */
  icon: LucideIcon;
  /** Tailwind colour class applied to the icon, e.g. "text-primary" */
  iconClass: string;
  /** Optional coloured dot beside the value (used for status-keyed cards) */
  dot?: string;
  /** Optional trend arrow + value, e.g. "+3 this week" */
  trend?: {
    direction: StatCardTrend;
    label: string;
  };
  /** When provided the card renders as a <a> or <Link>-compatible element */
  href?: string;
  /** Pass a React Router <Link> component to wrap the card */
  as?: React.ElementType;
  /** Extra wrapper class */
  className?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * StatCardSkeleton — drop-in placeholder while data loads.
 * Matches StatCard dimensions exactly so the layout does not shift.
 */
export function StatCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "rounded-xl border border-border bg-surface p-5 shadow-sm",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-4 w-4 rounded" />
      </div>
      <div className="mt-3 skeleton h-7 w-14 rounded" />
      <div className="mt-2 skeleton h-2.5 w-28 rounded" />
    </div>
  );
}

// ─── Trend indicator ──────────────────────────────────────────────────────────

const TREND_ICON: Record<StatCardTrend, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const TREND_CLASS: Record<StatCardTrend, string> = {
  up: "text-success-strong",
  down: "text-danger-text",
  neutral: "text-text-muted",
};

// ─── Card inner ───────────────────────────────────────────────────────────────

function CardInner({
  label,
  value,
  secondary,
  icon: Icon,
  iconClass,
  dot,
  trend,
}: StatCardProps) {
  const TrendIcon = trend ? TREND_ICON[trend.direction] : null;

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted leading-none">
          {label}
        </span>
        <Icon
          size={16}
          aria-hidden="true"
          className={`shrink-0 ${iconClass}`}
        />
      </div>

      {/* Value row */}
      <div className="mt-3 flex items-end gap-2">
        <strong className="text-2xl font-bold text-text leading-none tabular-nums">
          {value}
        </strong>
        {dot && (
          <span
            className={`mb-0.5 h-2 w-2 rounded-full shrink-0 ${dot}`}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Secondary + trend row */}
      <div className="mt-2 flex items-center justify-between gap-2">
        {secondary && (
          <p className="text-xs text-text-muted leading-snug">{secondary}</p>
        )}
        {trend && TrendIcon && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-medium shrink-0 ${TREND_CLASS[trend.direction]}`}
          >
            <TrendIcon size={12} aria-hidden="true" />
            {trend.label}
          </span>
        )}
      </div>
    </>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

/**
 * StatCard
 *
 * Operational metric tile used on the Dashboard and Claims page.
 *
 * - Renders as a plain `<article>` by default.
 * - Pass `as={Link}` + `href` to make the whole card a clickable link,
 *   useful when the metric is a doorway into a filtered list.
 * - `StatCardSkeleton` is the drop-in loading placeholder.
 *
 * Usage:
 *   <StatCard label="New" value={12} secondary="Awaiting assignment" icon={FilePlus2} iconClass="text-neutral-500" />
 *   <StatCard label="Approved" value={4} icon={CheckCircle2} iconClass="text-success-strong" as={Link} href="/claims?status=APPROVED" />
 */
export default function StatCard(props: StatCardProps) {
  const { as: Tag = "article", href, className = "", ...rest } = props;

  const baseClass = [
    "rounded-xl border border-border bg-surface p-5 shadow-sm",
    "transition-colors duration-150",
    href
      ? "cursor-pointer hover:border-primary/30 hover:bg-background group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
      : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // When used as a link, forward href; otherwise omit it (plain article)
  const linkProps = href ? { href, tabIndex: 0 } : {};

  return (
    <Tag className={baseClass} {...linkProps}>
      <CardInner {...rest} />
    </Tag>
  );
}

// ─── Summary card variant ─────────────────────────────────────────────────────

/**
 * SummaryCard — a wider, more detailed card used in detail views.
 * Shares the same design language as StatCard but renders a label/value
 * list instead of a single numeric metric.
 */
interface SummaryRow {
  label: string;
  value: ReactNode;
}

interface SummaryCardProps {
  title: string;
  rows: SummaryRow[];
  action?: ReactNode;
  className?: string;
}

export function SummaryCard({
  title,
  rows,
  action,
  className = "",
}: SummaryCardProps) {
  return (
    <section
      className={[
        "rounded-xl border border-border bg-surface p-5 shadow-sm",
        className,
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-semibold text-text">{title}</h3>
        {action}
      </div>

      <dl className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4"
          >
            <dt className="text-xs text-text-muted shrink-0">{row.label}</dt>
            <dd className="text-xs font-medium text-text text-end">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
