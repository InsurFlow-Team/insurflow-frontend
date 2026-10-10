import type { ReactNode } from "react";
import { AlertCircle, Inbox } from "lucide-react";
import Button from "./Button";
import { useTranslation } from "../../i18n/context";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  header: string;
  /** Tailwind width class, e.g. "w-40" or "w-1/4" */
  width?: string;
  /** Right-align numeric columns */
  numeric?: boolean;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  keyExtractor: (row: T) => string;
  onRetry?: () => void;
  /** Fires when a row is clicked — enables row as interactive region */
  onRowClick?: (row: T) => void;
  /** Aria label for the row when onRowClick is provided */
  rowAriaLabel?: (row: T) => string;
  /** Renders below the table body (e.g. Pagination) */
  footer?: ReactNode;
  /** Number of skeleton rows to show while loading (default: 5) */
  skeletonRows?: number;
  /** Adds a sticky table header when the table is inside a scrollable container */
  stickyHeader?: boolean;
  className?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="skeleton h-3 rounded"
            style={{ width: `${55 + ((i * 37) % 35)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// ─── Inline empty/error states ────────────────────────────────────────────────

function InlineEmpty({
  message,
  icon,
  colSpan,
}: {
  message: string;
  icon: ReactNode;
  colSpan: number;
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
          <span className="opacity-30">{icon}</span>
          <p className="text-sm">{message}</p>
        </div>
      </td>
    </tr>
  );
}

function InlineError({
  message,
  onRetry,
  colSpan,
}: {
  message: string;
  onRetry?: () => void;
  colSpan: number;
}) {
  const { t } = useTranslation();
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-muted">
          <AlertCircle size={32} className="text-danger" aria-hidden="true" />
          <p className="text-sm text-danger-text">{message}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              {t("common.tryAgain")}
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

/**
 * DataTable
 *
 * Consistent data table used across Claims, Adjusters, Users, and Assignments.
 *
 * Features:
 *   • Skeleton shimmer rows while loading (no layout shift)
 *   • Inline empty and error states (no full-page takeover)
 *   • Row click support with keyboard affordance (Enter/Space)
 *   • Sticky header option for long lists
 *   • Numeric column right-alignment
 *   • Footer slot for Pagination
 *   • RTL-aware cell alignment
 *
 * Usage:
 *   <DataTable
 *     columns={columns}
 *     data={claims}
 *     loading={loading}
 *     keyExtractor={(c) => c.id}
 *     onRowClick={(c) => navigate(`/claims/${c.id}`)}
 *     rowAriaLabel={(c) => `View claim ${c.claimNumber}`}
 *     footer={<Pagination ... />}
 *   />
 */
export default function DataTable<T>({
  columns,
  data,
  loading = false,
  error,
  emptyMessage,
  emptyIcon,
  keyExtractor,
  onRetry,
  onRowClick,
  rowAriaLabel,
  footer,
  skeletonRows = 5,
  stickyHeader = false,
  className = "",
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const colCount = columns.length;
  const isClickable = typeof onRowClick === "function";

  return (
    <div
      className={[
        "overflow-x-auto rounded-xl border border-border shadow-sm",
        className,
      ].join(" ")}
    >
      <table className="w-full text-sm text-start">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <thead
          className={[
            "bg-surface-soft border-b border-border",
            stickyHeader ? "sticky top-0 z-10" : "",
          ].join(" ")}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={[
                  "px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide",
                  col.width ?? "",
                  col.numeric ? "text-end" : "text-start",
                ].join(" ")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <tbody className="bg-surface divide-y divide-border">
          {/* Loading skeletons */}
          {loading &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow key={`sk-${i}`} cols={colCount} />
            ))}

          {/* Error state (only when not loading) */}
          {!loading && error && (
            <InlineError
              message={error ?? t("common.somethingWentWrong")}
              onRetry={onRetry}
              colSpan={colCount}
            />
          )}

          {/* Empty state (only when not loading and no error) */}
          {!loading && !error && data.length === 0 && (
            <InlineEmpty
              message={emptyMessage ?? t("common.noData")}
              icon={emptyIcon ?? <Inbox size={40} />}
              colSpan={colCount}
            />
          )}

          {/* Data rows */}
          {!loading &&
            !error &&
            data.map((row) => {
              const key = keyExtractor(row);
              const ariaLabel = rowAriaLabel?.(row);

              return (
                <tr
                  key={key}
                  onClick={isClickable ? () => onRowClick(row) : undefined}
                  onKeyDown={
                    isClickable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  tabIndex={isClickable ? 0 : undefined}
                  role={isClickable ? "button" : undefined}
                  aria-label={isClickable ? ariaLabel : undefined}
                  className={[
                    "transition-colors",
                    isClickable
                      ? "cursor-pointer hover:bg-background focus:outline-none focus-visible:bg-primary-light"
                      : "hover:bg-background/60",
                  ].join(" ")}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={[
                        "px-4 py-3 text-text",
                        col.numeric ? "text-end tabular-nums" : "",
                      ].join(" ")}
                    >
                      {col.render
                        ? col.render(row)
                        : String(
                            (row as Record<string, unknown>)[col.key] ?? "",
                          )}
                    </td>
                  ))}
                </tr>
              );
            })}
        </tbody>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        {footer && !loading && !error && data.length > 0 && (
          <tfoot className="bg-surface border-t border-border">
            <tr>
              <td colSpan={colCount} className="px-4 py-3">
                {footer}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
