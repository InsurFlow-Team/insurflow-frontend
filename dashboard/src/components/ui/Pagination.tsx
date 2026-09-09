import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

function getPageNumbers(
  current: number,
  total: number,
): Array<number | "…"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: Array<number | "…"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("…");
  for (let pageNumber = start; pageNumber <= end; pageNumber++) {
    pages.push(pageNumber);
  }
  if (end < total - 1) pages.push("…");
  pages.push(total);

  return pages;
}

function pageButtonClass(isCurrent: boolean) {
  return `inline-flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
    isCurrent
      ? "bg-primary border-transparent text-white"
      : "bg-surface border-border text-text-muted hover:bg-gray-50 hover:text-text"
  }`;
}

export default function Pagination({
  currentPage,
  totalPages,
  rowsPerPage,
  rowsPerPageOptions,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <span>Rows per page:</span>
        <select
          value={rowsPerPage}
          onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <span className="text-sm text-text-muted">
        Page {currentPage} of {totalPages}
      </span>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="First page"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={pageButtonClass(false)}
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={pageButtonClass(false)}
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers(currentPage, totalPages).map((item, index) =>
          item === "…" ? (
            <span
              key={`gap-${index}`}
              className="px-1.5 text-sm text-text-muted"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === currentPage ? "page" : undefined}
              className={pageButtonClass(item === currentPage)}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          aria-label="Next page"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={pageButtonClass(false)}
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          aria-label="Last page"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={pageButtonClass(false)}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
}