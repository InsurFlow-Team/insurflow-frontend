import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  message?: string;
  children?: ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  title,
  confirmLabel,
  cancelLabel = "Cancel",
  loading = false,
  onCancel,
  onConfirm,
  message,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      {message ? (
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center">
            <AlertTriangle size={22} className="text-accent" />
          </div>
          <p className="text-sm text-text-muted">{message}</p>
          <div className="flex gap-3 w-full mt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
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
      ) : (
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
      )}
    </Modal>
  );
}