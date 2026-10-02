import Modal from "./Modal";
import AssignClaimForm from "./assign/AssignClaimForm";
import type { ClaimPriority, FieldAdjuster } from "../../types";

interface AssignClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
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
  current,
  onAssigned,
  adjusters,
  adjustersLoading,
  initialAdjusterId,
  onRefetchAdjusters,
}: AssignClaimModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Field Adjuster"
      size="md"
    >
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