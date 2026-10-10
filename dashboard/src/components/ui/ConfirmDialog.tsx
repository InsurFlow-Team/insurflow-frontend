import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /**
   * Short description rendered in the message variant (icon + centred text).
   * When omitted, render `children` as the dialog body instead.
   */
  message?: string;
  children?: ReactNode;
  /** Use "destructive" (default) for irreversible actions, "primary" for safe confirmations. */
  confirmVariant?: "destructive" | "primary";
}

// ─── ConfirmDialog ────────────────────────────────────────────────────────────

/**
 * ConfirmDialog
 *
 * Two-button confirmation overlay for actions that are hard to reverse:
 *   • Reject claim      → variant="destructive"
 *   • Delete record     → variant="destructive"
 *   • Approve claim     → variant="primary"
 *   • Start review      → variant="primary"
 *
 * Pass `message` for a short centred prompt with an alert icon.
 * Pass `children` for a richer body (e.g. a rejection-reason form).
 *
 * The Cancel / Confirm buttons live in the `footer` slot so they remain
 * visible even when the dialog body is long.
 */
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
  confirmVariant = "destructive",
}: ConfirmDialogProps) {
  const footer = (
    <div className="flex gap-3">
      <Button
        variant="secondary"
        className="flex-1"
        onClick={onCancel}
        disabled={loading}
      >
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant}
        className="flex-1"
        onClick={onConfirm}
        loading={loading}
      >
        {confirmLabel}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={footer}
    >
      {message ? (
        /* Icon + centred message variant */
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center shrink-0">
            <AlertTriangle
              size={22}
              className="text-accent"
              aria-hidden="true"
            />
          </div>
          <p className="text-sm text-text-muted">{message}</p>
        </div>
      ) : (
        /* Rich body variant (e.g. rejection reason textarea) */
        <div>{children}</div>
      )}
    </Modal>
  );
}
