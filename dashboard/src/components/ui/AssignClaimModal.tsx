import Modal from "./Modal";
import AssignClaimForm from "./assign/AssignClaimForm";
import type { ClaimPriority } from "../../types";

interface AssignClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimId: string;
  current?: {
    priority?: ClaimPriority;
    notes?: string;
  };
  onAssigned: () => void;
}

export default function AssignClaimModal({
  isOpen,
  onClose,
  claimId,
  current,
  onAssigned,
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
        onAssigned={onAssigned}
        onClose={onClose}
      />
    </Modal>
  );
}