import type { ReactNode } from "react";

type GridColumns = "2" | "3" | "4" | "5";

const GRID_CLASS: Record<GridColumns, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
  "5": "sm:grid-cols-2 lg:grid-cols-5",
};

interface InfoGridProps {
  columns: GridColumns;
  children: ReactNode;
}

export default function InfoGrid({ columns, children }: InfoGridProps) {
  return <div className={`grid gap-5 ${GRID_CLASS[columns]}`}>{children}</div>;
}