import type { PolicyStatus } from "../../types";

interface PolicyStatusBadgeProps {
  status: PolicyStatus;
}

const policyStatusConfig: Record<
  PolicyStatus,
  { label: string; classes: string }
> = {
  ACTIVE:    { label: "Active",    classes: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  EXPIRED:   { label: "Expired",   classes: "bg-gray-100 text-text-muted border-border" },
  CANCELLED: { label: "Cancelled", classes: "bg-red-50 text-danger border-danger/20" },
  SUSPENDED: { label: "Suspended", classes: "bg-accent-light text-accent border-accent/20" },
};

export default function PolicyStatusBadge({ status }: PolicyStatusBadgeProps) {
  const config = policyStatusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
