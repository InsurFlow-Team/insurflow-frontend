import DataTable, { type Column } from "../ui/DataTable";
import Pagination from "../ui/Pagination";
import type { FieldAdjuster } from "../../types";

export const ADJUSTERS_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

interface AdjustersTableProps {
  columns: Column<FieldAdjuster>[];
  adjusters: FieldAdjuster[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  emptyMessage: string;
  rowsPerPage: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export default function AdjustersTable({
  columns,
  adjusters,
  loading,
  error,
  onRetry,
  emptyMessage,
  rowsPerPage,
  currentPage,
  totalPages,
  onPageChange,
  onRowsPerPageChange,
}: AdjustersTableProps) {
  return (
    <DataTable
      columns={columns}
      data={adjusters}
      loading={loading}
      error={error}
      onRetry={onRetry}
      emptyMessage={emptyMessage}
      keyExtractor={(adj) => adj.id}
      footer={
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={ADJUSTERS_ROWS_PER_PAGE_OPTIONS}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      }
    />
  );
}