import { ShieldCheck } from "lucide-react";
import type { PolicyInfo, PolicyStatus } from "../../types";
import PolicyStatusBadge from "./PolicyStatusBadge";

interface InfoRowProps {
  label: string;
  value?: string | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-text">{value ?? "—"}</p>
    </div>
  );
}

function formatDate(value?: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

const KNOWN_POLICY_STATUSES = new Set<PolicyStatus>([
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "SUSPENDED",
]);

function toPolicyStatus(value?: string | null): PolicyStatus | null {
  if (value && KNOWN_POLICY_STATUSES.has(value as PolicyStatus)) {
    return value as PolicyStatus;
  }
  return null;
}

interface PolicyInfoCardProps {
  policy: PolicyInfo;
}

export default function PolicyInfoCard({ policy }: PolicyInfoCardProps) {
  const policyStatus = toPolicyStatus(policy.status);

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck size={18} className="text-primary shrink-0" />
        <h2 className="text-lg font-semibold text-text">Policy Information</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <InfoRow label="Policy Number" value={policy.policyNumber} />

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Policy Status
          </p>
          <div className="mt-1">
            {policyStatus ? (
              <PolicyStatusBadge status={policyStatus} />
            ) : (
              <p className="text-sm text-text">{policy.status ?? "—"}</p>
            )}
          </div>
        </div>

        <InfoRow label="Start Date"   value={formatDate(policy.startDate)} />
        <InfoRow label="Expiry Date"  value={formatDate(policy.expiryDate)} />
      </div>
    </section>
  );
}
