import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
  ExternalLink,
  PlayCircle,
} from "lucide-react";

import {
  getClaimById,
  startClaimReview,
} from "../api/claims.service";
import { getApiErrorMessage } from "../api/client";
import type { ClaimDetails as ClaimDetailsType } from "../types";
import StatusBadge from "../components/ui/StatusBadge";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import { toast } from "../contexts/ToastContext";

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

      <p className="mt-1 text-sm text-text">
        {value || "—"}
      </p>
    </div>
  );
}

export default function ClaimDetails() {
  const { claimId } = useParams<{ claimId: string }>();
    const { user } = useAuth();

  const [claim, setClaim] = useState<ClaimDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState<{
  url: string;
  name: string;
} | null>(null);

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

    try {
      await startClaimReview(claimId);
      await loadClaim();

      toast(
        "success",
        "Claim review started successfully. Status changed to UNDER_REVIEW.",
      );
    } catch (requestError) {
      toast("error", getApiErrorMessage(requestError));
    } finally {
      setReviewing(false);
      setShowReviewDialog(false);
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

  const sortedTimeline = [...claim.timeline].sort(
    (firstEvent, secondEvent) =>
      new Date(String(secondEvent.timestamp ?? "")).getTime() -
      new Date(String(firstEvent.timestamp ?? "")).getTime(),
  );
  const evidenceItems = [
  ...(claim.evidence ?? []),
  ...(claim.attachments ?? []),
];

const signature = claim.signature ?? null;
const decisions = claim.decisions ?? [];
const correctionNotes = claim.correctionNotes ?? [];

const canStartReview =
  user?.role === "CLAIMS_OFFICER" &&
  claim.status === "SUBMITTED";
  
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
          <Button
            onClick={() => setShowReviewDialog(true)}
            disabled={reviewing}
            icon={<PlayCircle size={17} />}
          >
            Start Review
          </Button>
        )}
      </div>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          Claim information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow label="Claim Number" value={claim.claimNumber} />
          <InfoRow label="Claim Status" value={claim.status} />
          <InfoRow
            label="Submission Date"
            value={formatDate(claim.createdAt)}
          />
          <InfoRow
            label="Last Updated"
            value={formatDate(claim.updatedAt)}
          />
          <InfoRow
            label="Field Adjuster Name"
            value={assignedTo?.name}
          />
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
          <h2 className="text-lg font-semibold text-text">
            Customer information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <InfoRow
              label="Customer Name"
              value={claim.customer.name}
            />
            <InfoRow
              label="Phone Number"
              value={claim.customer.phone}
            />
            <InfoRow
              label="Customer Policy Number"
              value={vehicle.policyId}
            />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text">
            Policy information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <InfoRow
              label="Policy Number"
              value={claim.policy?.policyNumber}
            />
            <InfoRow
              label="Policy Status"
              value={claim.policy?.status}
            />
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
          <InfoRow
            label="Accident Type"
            value={accident?.accidentType}
          />
          <InfoRow
            label="Accident Date"
            value={accident?.accidentDate}
          />
          <InfoRow
            label="Accident Time"
            value={accident?.accidentTime}
          />
          <InfoRow
            label="Accident Description"
            value={accident?.description}
          />
          <InfoRow
            label="Damage Description"
            value={accident?.damageDescription}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          Location information
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <InfoRow label="Street" value={location?.address} />
          <InfoRow label="Area" value={claim.incidentLocation} />

          <InfoRow
            label="Coordinates"
            value={
              location?.latitude !== undefined &&
              location?.longitude !== undefined
                ? `${location.latitude}, ${location.longitude}`
                : null
            }
          />
        </div>

        {location?.latitude !== undefined &&
          location?.longitude !== undefined && (
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

      <div className="grid gap-6 lg:grid-cols-2">
  <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-text">
      Evidence & Attachments
    </h2>

    {evidenceItems.length === 0 ? (
      <p className="mt-5 text-sm text-text-muted">
        No evidence or attachments available.
      </p>
    ) : (
      <div className="mt-5 space-y-3">
        {evidenceItems.map((item, index) => {
         
          const itemName = String(
            item.fileName ??
              item.name ??
              item.type ??
              `Evidence ${index + 1}`,
          );

          const itemUrl =
            typeof item.url === "string"
              ? item.url
              : typeof item.fileUrl === "string"
                ? item.fileUrl
                : null;

                const isImage =
  itemUrl !== null &&
  /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(itemUrl);

          return (
            <div
              key={`${itemName}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <span className="text-sm font-medium text-text">
                {itemName}
              </span>

              {itemUrl &&
  (isImage ? (
    <button
      type="button"
      onClick={() =>
        setPreviewImage({
          url: itemUrl,
          name: itemName,
        })
      }
      className="text-sm font-semibold text-primary hover:text-primary-dark"
    >
      Preview
    </button>
  ) : (
    <a
      href={itemUrl}
      target="_blank"
      rel="noreferrer"
      className="text-sm font-semibold text-primary hover:text-primary-dark"
    >
      Open
    </a>
  ))}
            </div>
          );
        })}
      </div>
    )}
  </section>

  <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-text">
      Customer Signature
    </h2>

    <div className="mt-5 grid gap-5 sm:grid-cols-2">
      <InfoRow
        label="Signature Status"
        value={signature ? "Signed" : "Not available"}
      />

      <InfoRow
        label="Signed By"
        value={
          signature
            ? String(
                signature.signerName ??
                  signature.signedBy ??
                  "Customer",
              )
            : null
        }
      />

      <InfoRow
        label="Signed At"
        value={
          signature
            ? formatDate(
                String(
                  signature.signedAt ??
                    signature.timestamp ??
                    "",
                ),
              )
            : null
        }
      />
    </div>
  </section>
</div>


<div className="grid gap-6 lg:grid-cols-2">
  <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-text">
      Decisions
    </h2>

    {decisions.length === 0 ? (
      <p className="mt-5 text-sm text-text-muted">
        No decisions available.
      </p>
    ) : (
      <div className="mt-5 space-y-3">
        {decisions.map((decision, index) => (
          <div
            key={`decision-${index}`}
            className="rounded-lg border border-border p-4"
          >
            <p className="text-sm font-semibold text-text">
              {String(
                decision.decision ??
                  decision.action ??
                  decision.status ??
                  "Decision",
              )}
            </p>

            <p className="mt-2 text-sm text-text-muted">
              {String(
                decision.notes ??
                  decision.reason ??
                  "No additional notes.",
              )}
            </p>

            {Boolean(decision.createdAt || decision.timestamp) && (
              <p className="mt-2 text-xs text-text-muted">
                {formatDate(
                  String(
                    decision.createdAt ??
                      decision.timestamp ??
                      "",
                  ),
                )}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </section>

  <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-text">
      Correction Notes
    </h2>

    {correctionNotes.length === 0 ? (
      <p className="mt-5 text-sm text-text-muted">
        No correction notes available.
      </p>
    ) : (
      <div className="mt-5 space-y-3">
        {correctionNotes.map((note, index) => (
          <div
            key={`correction-${index}`}
            className="rounded-lg border border-border p-4"
          >
            <p className="text-sm text-text">
              {String(
                note.note ??
                  note.message ??
                  note.reason ??
                  "Correction requested",
              )}
            </p>

            {Boolean(note.createdAt || note.timestamp) && (
              <p className="mt-2 text-xs text-text-muted">
                {formatDate(
                  String(
                    note.createdAt ??
                      note.timestamp ??
                      "",
                  ),
                )}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </section>
</div>
      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text">
          Claim Timeline
        </h2>

        {sortedTimeline.length === 0 ? (
          <p className="mt-5 text-sm text-text-muted">
            No timeline events available.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {sortedTimeline.map((event, index) => {
              const performedBy = event.performedBy as {
                name?: string;
              } | null;

              return (
                <div
                  key={`${String(event.timestamp)}-${index}`}
                  className="border-l-2 border-primary pl-4"
                >
                  <p className="text-sm font-semibold text-text">
                    {String(event.action ?? "Unknown action")}
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    User: {performedBy?.name ?? "Unknown user"}
                  </p>

                  <p className="mt-1 text-xs text-text-muted">
                    {formatDate(String(event.timestamp ?? ""))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <Modal
  isOpen={Boolean(previewImage)}
  onClose={() => setPreviewImage(null)}
  title={previewImage?.name ?? "Image Preview"}
  size="lg"
>
  {previewImage && (
    <div className="space-y-4">
      <img
        src={previewImage.url}
        alt={previewImage.name}
        className="max-h-[70vh] w-full rounded-lg object-contain"
      />

      <a
        href={previewImage.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex text-sm font-semibold text-primary hover:text-primary-dark"
      >
        Open original image
      </a>
    </div>
  )}
</Modal>

      <ConfirmDialog
        isOpen={showReviewDialog}
        onCancel={() => setShowReviewDialog(false)}
        onConfirm={() => void handleStartReview()}
        title="Start claim review?"
        message="This will change the claim status from SUBMITTED to UNDER_REVIEW."
        confirmLabel="Start Review"
        cancelLabel="Cancel"
        loading={reviewing}
      />
    </div>
  );
}