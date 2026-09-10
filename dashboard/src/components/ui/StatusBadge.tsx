import type {
  UserStatus,
  ClaimStatus,
  InspectionTaskStatus,
  Availability,
} from "../../types";

type Status =
  | UserStatus
  | ClaimStatus
  | InspectionTaskStatus
  | Availability;

interface StatusBadgeProps {
  status: Status;
}

interface StatusConfig {
  label: string;
  classes: string;
  dot?: string;
}

const statusConfig: Record<Status, StatusConfig> = {
  // User statuses
  ACTIVE: {
    label: "Active",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },

  INACTIVE: {
    label: "Inactive",
    classes: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },

  // Claim and inspection statuses
  NEW: {
    label: "New",
    classes: "bg-slate-50 text-slate-700 border-slate-200",
  },

  ASSIGNED: {
    label: "Assigned",
    classes: "bg-purple-50 text-purple-700 border-purple-200",
  },

  IN_PROGRESS: {
    label: "In Progress",
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },

  SUBMITTED: {
    label: "Submitted",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },

  UNDER_REVIEW: {
    label: "Under Review",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },

  CORRECTION_REQUIRED: {
    label: "Correction Required",
    classes: "bg-orange-50 text-orange-700 border-orange-200",
  },

  APPROVED: {
    label: "Approved",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  REJECTED: {
    label: "Rejected",
    classes: "bg-red-50 text-red-700 border-red-200",
  },

  CLOSED: {
    label: "Closed",
    classes: "bg-gray-100 text-gray-600 border-gray-200",
  },

  // Field adjuster availability
  AVAILABLE: {
    label: "Available",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },

  UNAVAILABLE: {
    label: "Unavailable",
    classes: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config =
    statusConfig[status] ?? {
      label: "Unknown",
      classes: "bg-gray-100 text-gray-500 border-gray-200",
    };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.classes}`}
    >
      {config.dot && (
        <span
          className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${config.dot}`}
        />
      )}

      {config.label}
    </span>
  );
}