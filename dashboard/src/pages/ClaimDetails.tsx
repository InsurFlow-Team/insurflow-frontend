import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PlayCircle } from "lucide-react";

import {
  getClaimById,
  startClaimReview,
} from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimDetails as ClaimDetailsType } from "../types";
import StatusBadge from "../components/ui/StatusBadge";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-text">{value || "—"}</p>
    </div>
  );
}

export default function ClaimDetails() {
  const { claimId } = useParams<{ claimId: string }>();
  const [claim, setClaim] = useState<ClaimDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const loadClaim = useCallback(async () => {
    if (!claimId) return;

    setLoading(true);
    setError("");

    try {
      const data = await getClaimById(claimId);
      setClaim(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    void loadClaim();
  }, [loadClaim]);

  async function handleStartReview() {
    if (!claimId) return;

    setReviewing(true);
    setActionError("");

    try {
      await startClaimReview(claimId);
      await loadClaim();
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError));
    } finally {
      setReviewing(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading claim details..." />;
  }

  if (error || !claim) {
    return (
      <ErrorState
        message={error || "Claim not found."}
        onRetry={() => void loadClaim()}
      />
    );
  }

  const canStartReview = claim.status === "SUBMITTED";

  return (
    <div className="space-y-6">
      <Link
        to="/claims"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark"
      >
        <ArrowLeft size={16} />
        Back to claims
      </Link>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-muted">Claim number</p>
          <h1 className="mt-1 text-2xl font-bold text-text">
            {claim.claimNumber}
          </h1>
          <div className="mt-3">
            <StatusBadge status={claim.status} />
          </div>
        </div>

        {canStartReview && (
          <button
            type="button"
            onClick={() => void handleStartReview()}
            disabled={reviewing}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlayCircle size={17} />
            {reviewing ? "Starting review..." : "Start review"}
          </button>
        )}
      </div>

      {actionError && (
        <div className="rounded-lg border border-danger/20 bg-red-50 px-4 py-3 text-sm text-danger">
          {actionError}
        </div>
      )}

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Claim information</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Claim number" value={claim.claimNumber} />
          <InfoRow label="Incident type" value={claim.incidentType} />
          <InfoRow label="Created" value={formatDate(claim.createdAt)} />
          <InfoRow label="Updated" value={formatDate(claim.updatedAt)} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Customer</h2>

          <div className="mt-5 space-y-4">
            <InfoRow label="Name" value={claim.customer.name} />
            <InfoRow label="Phone" value={claim.customer.phone} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Vehicle & policy</h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoRow label="Plate number" value={claim.vehicle.plateNumber} />
            <InfoRow label="Vehicle ID" value={claim.vehicle.vehicleId} />
            <InfoRow label="Policy ID" value={claim.vehicle.policyId} />
            <InfoRow label="Customer ID" value={claim.vehicle.customerId} />
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Accident & location</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <InfoRow label="Incident location" value={claim.incidentLocation} />
          <InfoRow label="Assignment priority" value={claim.assignment.priority} />
          <InfoRow
            label="Assignment notes"
            value={claim.assignment.assignmentNotes}
          />
          <InfoRow label="Assigned at" value={formatDate(claim.assignment.assignedAt)} />
        </div>
      </section>
    </div>
  );
}