import { CheckCircle2 } from "lucide-react";
import Button from "../Button";
import PolicyStatusBadge from "../PolicyStatusBadge";
import type { PolicyInfo, PolicyStatus } from "../../../types";

const POLICY_STATUSES = new Set<PolicyStatus>([
  "ACTIVE",
  "EXPIRED",
  "CANCELLED",
  "SUSPENDED",
]);

function toPolicyStatus(value?: PolicyStatus | null): PolicyStatus | null {
  return value && POLICY_STATUSES.has(value) ? value : null;
}

function formatDate(value?: string | null): string {
  return value
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(value),
      )
    : "—";
}

interface VerifiedPolicyResultProps {
  policy: PolicyInfo;
  onReset: () => void;
  onContinue: () => void;
}

export default function VerifiedPolicyResult({
  policy,
  onReset,
  onContinue,
}: VerifiedPolicyResultProps) {
  const status = toPolicyStatus(policy.status);

  return (
    <>
      <div
        role="status"
        className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
      >
        <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
        <span>Policy verified successfully.</span>
      </div>

      <div className="space-y-3 p-4 rounded-lg bg-surface-soft border border-border">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Policy Number
            </p>
            <p className="mt-1 text-sm font-medium text-text">
              {policy.policyNumber ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Policy Status
            </p>
            <div className="mt-1">
              {status ? (
                <PolicyStatusBadge status={status} />
              ) : (
                <p className="text-sm text-text">{policy.status ?? "—"}</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Start Date
            </p>
            <p className="mt-1 text-sm text-text">
              {formatDate(policy.startDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Expiry Date
            </p>
            <p className="mt-1 text-sm text-text">
              {formatDate(policy.expiryDate)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-text-muted">
        Insured name, insurance company, and vehicle details appear here once
        the backend policy-verification contract is connected.
      </p>

      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-700">
        Development mock data
      </span>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="secondary" onClick={onReset}>
          تحقق من وثيقة أخرى
        </Button>
        <Button type="button" variant="primary" onClick={onContinue}>
          متابعة تسجيل الحادث
        </Button>
      </div>
    </>
  );
}