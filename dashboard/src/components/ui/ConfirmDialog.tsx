import type { ReactNode } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  children: ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  title,
  confirmLabel,
  loading = false,
  onCancel,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="space-y-4">
        {children}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {loading ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}