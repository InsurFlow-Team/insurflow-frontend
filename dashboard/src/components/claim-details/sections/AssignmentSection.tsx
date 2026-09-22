import { UserCheck } from "lucide-react";
import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";

interface AssignmentSectionProps {
  claim: ClaimDetails;
  canAssign: boolean;
  onAssign: () => void;
}

export default function AssignmentSection({
  claim,
  canAssign,
  onAssign,
}: AssignmentSectionProps) {
  const assignedTo = claim.assignment.assignedTo as { name?: string } | null;

  return (
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
  );
}