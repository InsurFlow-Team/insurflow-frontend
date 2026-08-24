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

const statusConfig: Record<Status, { label: string; classes: string }> = {
  // User
  ACTIVE:       { label: "Active",        classes: "bg-primary-light text-primary-dark border-primary/20" },
  INACTIVE:     { label: "Inactive",      classes: "bg-gray-100 text-text-muted border-border" },
  // Claim
  SUBMITTED:    { label: "Submitted",     classes: "bg-blue-50 text-info border-info/20" },
  UNDER_REVIEW: { label: "Under Review",  classes: "bg-accent-light text-accent border-accent/20" },
  CLOSED:       { label: "Closed",        classes: "bg-gray-100 text-text-muted border-border" },
  // Inspection Task
  ASSIGNED:     { label: "Assigned",      classes: "bg-purple-50 text-purple-700 border-purple-200" },
  IN_PROGRESS:  { label: "In Progress",   classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  // Availability
  AVAILABLE:    { label: "Available",     classes: "bg-primary-light text-primary-dark border-primary/20" },
  UNAVAILABLE:  { label: "Unavailable",   classes: "bg-red-50 text-danger border-danger/20" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
