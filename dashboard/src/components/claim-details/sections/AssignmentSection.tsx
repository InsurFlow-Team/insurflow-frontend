import { UserCheck } from "lucide-react";
import DetailSection from "../DetailSection";
import InfoGrid from "../InfoGrid";
import InfoRow from "../InfoRow";
import { formatDateTime } from "../../../utils/claims";
import type { ClaimDetails } from "../../../types";
import { useTranslation } from "../../../i18n/context";

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
  const { t } = useTranslation();
  const { assignedTo, assignedBy } = claim.assignment;

  return (
    <DetailSection
      title={t("claimInfo.assignment.title")}
      action={
        canAssign ? (
          <button
            type="button"
            onClick={onAssign}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text hover:bg-background disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            <UserCheck size={16} />
            {t("claimInfo.assignment.assign")}
          </button>
        ) : undefined
      }
    >
      {assignedTo ? (
        <InfoGrid columns="4">
          <InfoRow
            label={t("claimInfo.assignment.adjuster")}
            value={assignedTo.name}
          />
          <InfoRow
            label={t("claimInfo.assignment.assignedBy")}
            value={assignedBy ? `${assignedBy.name}` : null}
          />
          <InfoRow
            label={t("claimInfo.assignment.assignedAt")}
            value={formatDateTime(claim.assignment.assignedAt)}
          />
          <InfoRow
            label={t("claimInfo.assignment.priority")}
            value={claim.assignment.priority}
          />
          <InfoRow
            label={t("claimInfo.assignment.notes")}
            value={claim.assignment.assignmentNotes}
          />
        </InfoGrid>
      ) : (
        <p className="text-sm text-text-muted">
          {t("claimInfo.assignment.unassigned")}
        </p>
      )}
    </DetailSection>
  );
}