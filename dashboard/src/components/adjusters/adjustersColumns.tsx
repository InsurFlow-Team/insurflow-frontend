import { Eye } from "lucide-react";
import type { Column } from "../ui/DataTable";
import StatusBadge from "../ui/StatusBadge";
import { avatarClasses, userInitials } from "../../utils/user";
import ActiveTasksCell from "./ActiveTasksCell";
import type { FieldAdjuster } from "../../types";

interface AdjusterColumnsHandlers {
  onView: (adjuster: FieldAdjuster) => void;
}

export function buildAdjusterColumns({
  onView,
}: AdjusterColumnsHandlers): Column<FieldAdjuster>[] {
  return [
    {
      key: "name",
      header: "Adjuster",
      render: (adjuster) => (
        <button
          type="button"
          onClick={() => onView(adjuster)}
          className="flex items-center gap-3 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
        >
          <span
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarClasses(adjuster.name)}`}
          >
            {userInitials(adjuster.name)}
          </span>
          <span className="min-w-0">
            <span className="block font-medium text-text truncate hover:text-primary transition-colors">
              {adjuster.name}
            </span>
            <span className="block text-xs text-text-muted truncate">
              Field Adjuster
            </span>
          </span>
        </button>
      ),
    },
    {
      key: "employeeCode",
      header: "Employee Code",
      render: (adjuster) => (
        <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {adjuster.employeeCode}
        </span>
      ),
    },
    {
      key: "organizationName",
      header: "Organization",
      render: (adjuster) => (
        <span className="text-sm text-text line-clamp-2">
          {adjuster.organizationName}
        </span>
      ),
    },
    {
      key: "activeTasksCount",
      header: "Active Tasks / Limit",
      render: (adjuster) => (
        <ActiveTasksCell
          activeTasksCount={adjuster.activeTasksCount}
          capacityLimit={adjuster.capacityLimit}
        />
      ),
    },
    {
      key: "availability",
      header: "Availability",
      render: (adjuster) => <StatusBadge status={adjuster.availability} />,
    },
    {
      key: "status",
      header: "Status",
      render: (adjuster) => <StatusBadge status={adjuster.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (adjuster) => (
        <button
          type="button"
          onClick={() => onView(adjuster)}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-muted hover:text-text hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
        >
          <Eye size={14} />
          View
        </button>
      ),
    },
  ];
}