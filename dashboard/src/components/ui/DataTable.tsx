import type { ReactNode } from "react";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  keyExtractor: (row: T) => string;
  onRetry?: () => void;
  footer?: ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  loading,
  error,
  emptyMessage = "No data found.",
  keyExtractor,
  onRetry,
  footer,
}: DataTableProps<T>) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (data.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="bg-surface-soft border-b border-border">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wide"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {data.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="hover:bg-background transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-text">
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot className="bg-surface border-t border-border">
            <tr>
              <td colSpan={columns.length} className="px-4 py-3">
                {footer}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
