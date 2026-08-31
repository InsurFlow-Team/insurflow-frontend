import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, PlayCircle } from "lucide-react";

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
  value?: string | number | null;
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

  const vehicle = claim.vehicle;
  const accident = claim.accident as {
    accidentType?: string;
    accidentDate?: string;
    accidentTime?: string;
    description?: string;
    damageDescription?: string;
  } | null;

  const location = claim.location as {
    latitude?: number;
    longitude?: number;
    address?: string;
  } | null;

  const assignedTo = claim.assignment.assignedTo as {
    name?: string;
  } | null;

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
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary disabled:opacity-60"
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
        <h2 className="text-lg font-semibold text-text">
          Claim information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Claim Number" value={claim.claimNumber} />
          <InfoRow label="Submission Date" value={formatDate(claim.createdAt)} />
          <InfoRow label="Last Updated" value={formatDate(claim.updatedAt)} />
          <InfoRow label="Field Adjuster Name" value={assignedTo?.name} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          Vehicle information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <InfoRow label="Plate Number" value={vehicle.plateNumber} />
          <InfoRow label="Vehicle Make" value={vehicle.make} />
          <InfoRow label="Vehicle Model" value={vehicle.model} />
          <InfoRow label="Vehicle Year" value={vehicle.year} />
          <InfoRow label="Vehicle Color" value={vehicle.color} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Customer</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <InfoRow label="Customer Name" value={claim.customer.name} />
            <InfoRow label="Phone Number" value={claim.customer.phone} />
            <InfoRow label="Customer Policy Number" value={vehicle.policyId} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">Policy</h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <InfoRow label="Policy Number" value={claim.policy?.policyNumber} />
            <InfoRow label="Policy Status" value={claim.policy?.status} />
            <InfoRow
              label="Policy Start Date"
              value={formatDate(claim.policy?.startDate)}
            />
            <InfoRow
              label="Policy Expiry Date"
              value={formatDate(claim.policy?.expiryDate)}
            />
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          Accident information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <InfoRow label="Accident Type" value={accident?.accidentType} />
          <InfoRow label="Accident Date" value={accident?.accidentDate} />
          <InfoRow label="Accident Time" value={accident?.accidentTime} />
          <InfoRow label="Accident Description" value={accident?.description} />
          <InfoRow
            label="Damage Description"
            value={accident?.damageDescription}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Location</h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Street" value={location?.address} />
          <InfoRow label="Area" value={claim.incidentLocation} />
          <InfoRow
            label="Coordinates"
            value={
              location?.latitude && location?.longitude
                ? `${location.latitude}, ${location.longitude}`
                : null
            }
          />
        </div>

        {location?.latitude && location?.longitude && (
          <a
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            <ExternalLink size={16} />
            View on Map
          </a>
        )}
      </section>
    </div>
  );
}