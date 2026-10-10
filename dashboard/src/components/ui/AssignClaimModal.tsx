import Modal from "./Modal";
import AssignClaimForm from "./assign/AssignClaimForm";
import { useTranslation } from "../../i18n/context";
import type { ClaimPriority, FieldAdjuster } from "../../types";

interface AssignClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  claimNumber?: string;
  current?: {
    priority?: ClaimPriority;
    notes?: string;
  };
  onAssigned: () => void;
  // Map Dispatch shares its already-fetched claim-scoped adjusters (markers +
  // dropdown = one dataset) so the modal never duplicates GET /users/adjusters.
  adjusters?: FieldAdjuster[];
  adjustersLoading?: boolean;
  initialAdjusterId?: string;
  onRefetchAdjusters?: () => void;
}

export default function AssignClaimModal({
  isOpen,
  onClose,
  claimId,
  claimNumber,
  current,
  onAssigned,
  adjusters,
  adjustersLoading,
  initialAdjusterId,
  onRefetchAdjusters,
}: AssignClaimModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("map.assignFieldAdjuster")}
      size="md"
    >
      {claimNumber && (
        <p className="border-b border-border px-5 py-3 text-sm text-text-muted">
          {t("assign.claimContext")}:{" "}
          <span className="font-semibold text-text">{claimNumber}</span>
        </p>
      )}
      <AssignClaimForm
        key={claimId}
        claimId={claimId}
        initialPriority={current?.priority}
        initialNotes={current?.notes}
        initialAdjusterId={initialAdjusterId}
        adjusters={adjusters}
        adjustersLoading={adjustersLoading}
        onRefetchAdjusters={onRefetchAdjusters}
        onAssigned={onAssigned}
        onClose={onClose}
      />
    </Modal>
  );
}