import { UserCheck, ExternalLink } from "lucide-react";
import { formatDateTime } from "../../utils/claims";
import InfoRow from "./InfoRow";
import DetailSection from "./DetailSection";
import type { ClaimDetails as ClaimDetailsType } from "../../types";

interface ClaimInfoSectionsProps {
  claim: ClaimDetailsType;
  canAssign: boolean;
  onAssign: () => void;
}

function InfoGrid({
  columns,
  children,
}: {
  columns: "2" | "3" | "4" | "5";
  children: React.ReactNode;
}) {
  const gridClass = {
    "2": "sm:grid-cols-2",
    "3": "sm:grid-cols-2 lg:grid-cols-3",
    "4": "sm:grid-cols-2 lg:grid-cols-4",
    "5": "sm:grid-cols-2 lg:grid-cols-5",
  }[columns];

  return (
    <div className={`grid gap-5 ${gridClass}`}>{children}</div>
  );
}

export default function ClaimInfoSections({
  claim,
  canAssign,
  onAssign,
}: ClaimInfoSectionsProps) {
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

  const hasCoordinates =
    location?.latitude !== undefined && location?.longitude !== undefined;

  return (
    <div className="space-y-6">
      <DetailSection title="Claim information">
        <InfoGrid columns="4">
          <InfoRow label="Claim Number" value={claim.claimNumber} />
          <InfoRow label="Claim Status" value={claim.status} />
          <InfoRow
            label="Submission Date"
            value={formatDateTime(claim.createdAt)}
          />
          <InfoRow
            label="Last Updated"
            value={formatDateTime(claim.updatedAt)}
          />
          <InfoRow label="Field Adjuster Name" value={assignedTo?.name} />
        </InfoGrid>
      </DetailSection>

      <DetailSection
        title="Assignment"
        action={
          canAssign ? (
            <button
              type="button"
              onClick={onAssign}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text hover:bg-background disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              <UserCheck size={16} />
              Assign Field Adjuster
            </button>
          ) : undefined
        }
      >
        <InfoGrid columns="4">
          <InfoRow label="Field Adjuster" value={assignedTo?.name} />
          <InfoRow label="Priority" value={claim.assignment.priority} />
          <InfoRow
            label="Assigned At"
            value={formatDateTime(claim.assignment.assignedAt)}
          />
          <InfoRow
            label="Assignment Notes"
            value={claim.assignment.assignmentNotes}
          />
        </InfoGrid>
      </DetailSection>

      <DetailSection title="Vehicle information">
        <InfoGrid columns="5">
          <InfoRow label="Plate Number" value={vehicle.plateNumber} />
          <InfoRow label="Vehicle Make" value={vehicle.make} />
          <InfoRow label="Vehicle Model" value={vehicle.model} />
          <InfoRow label="Vehicle Year" value={vehicle.year} />
          <InfoRow label="Vehicle Color" value={vehicle.color} />
        </InfoGrid>
      </DetailSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailSection title="Customer information">
          <InfoGrid columns="2">
            <InfoRow label="Customer Name" value={claim.customer.name} />
            <InfoRow label="Phone Number" value={claim.customer.phone} />
            <InfoRow label="Customer Policy Number" value={vehicle.policyId} />
          </InfoGrid>
        </DetailSection>

        <DetailSection title="Policy information">
          <InfoGrid columns="2">
            <InfoRow
              label="Policy Number"
              value={claim.policy?.policyNumber}
            />
            <InfoRow label="Policy Status" value={claim.policy?.status} />
            <InfoRow
              label="Policy Start Date"
              value={formatDateTime(claim.policy?.startDate)}
            />
            <InfoRow
              label="Policy Expiry Date"
              value={formatDateTime(claim.policy?.expiryDate)}
            />
          </InfoGrid>
        </DetailSection>
      </div>

      <DetailSection title="Accident information">
        <InfoGrid columns="2">
          <InfoRow label="Accident Type" value={accident?.accidentType} />
          <InfoRow label="Accident Date" value={accident?.accidentDate} />
          <InfoRow label="Accident Time" value={accident?.accidentTime} />
          <InfoRow
            label="Accident Description"
            value={accident?.description}
          />
          <InfoRow
            label="Damage Description"
            value={accident?.damageDescription}
          />
        </InfoGrid>
      </DetailSection>

      <DetailSection title="Location information">
        <InfoGrid columns="3">
          <InfoRow label="Street" value={location?.address} />
          <InfoRow label="Area" value={claim.incidentLocation} />
          <InfoRow
            label="Coordinates"
            value={
              hasCoordinates
                ? `${location.latitude}, ${location.longitude}`
                : null
            }
          />
        </InfoGrid>

        {hasCoordinates && (
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
      </DetailSection>
    </div>
  );
}