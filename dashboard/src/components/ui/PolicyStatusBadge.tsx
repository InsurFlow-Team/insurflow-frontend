import type { PolicyStatus } from "../../types";

interface PolicyStatusBadgeProps {
  status: PolicyStatus;
}

const policyStatusConfig: Record<
  PolicyStatus,
  { label: string; classes: string }
> = {
  ACTIVE:    { label: "Active",    classes: "bg-success-bg text-success-strong border-success-border" },
  EXPIRED:   { label: "Expired",   classes: "bg-surface-sunken text-text-muted border-border" },
  CANCELLED: { label: "Cancelled", classes: "bg-danger-bg text-danger border-danger/20" },
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
