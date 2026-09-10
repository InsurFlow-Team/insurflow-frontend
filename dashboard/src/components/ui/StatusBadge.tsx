import type {
  UserStatus,
  ClaimStatus,
  InspectionTaskStatus,
  Availability,
} from "../../types";

type Status = UserStatus | ClaimStatus | InspectionTaskStatus | Availability;

interface StatusBadgeProps {
  status: Status;
}

interface StatusConfig {
  label: string;
  classes: string;
  dot?: string;
}

const statusConfig: Record<Status, StatusConfig> = {
  // User
  ACTIVE: {
    label: "Active",
    classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
  },
  INACTIVE: {
    label: "Inactive",
    classes: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
  // Claim
  NEW:          { label: "New",           classes: "bg-gray-100 text-gray-700 border-gray-200" },
  SUBMITTED:    { label: "Submitted",     classes: "bg-blue-50 text-info border-blue-200" },
  UNDER_REVIEW: { label: "Under Review",  classes: "bg-accent-light text-accent border-amber-200" },
  APPROVED:     { label: "Approved",      classes: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  CLOSED:       { label: "Closed",        classes: "bg-gray-100 text-gray-500 border-gray-200" },
  // Inspection Task
  ASSIGNED:     { label: "Assigned",      classes: "bg-purple-50 text-purple-700 border-purple-200" },
  IN_PROGRESS:  { label: "In Progress",   classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  // Availability
  AVAILABLE: {
    label: "Available",
    classes: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
  },
  UNAVAILABLE: {
    label: "Unavailable",
    classes: "bg-red-50 text-danger border-danger/20",
    dot: "bg-danger",
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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      {config.dot && (
        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </span>
  );
}