import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToast, type ToastKind } from "../../contexts/ToastContext";

const ICONS: Record<ToastKind, ReactNode> = {
  success: <CheckCircle2 size={17} className="text-success shrink-0" />,
  error: <AlertCircle size={17} className="text-danger shrink-0" />,
  info: <Info size={17} className="text-info shrink-0" />,
};

export default function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-xs flex-col gap-2">
      {toasts.map((toastItem) => (
        <div
          key={toastItem.id}
          role={toastItem.kind === "error" ? "alert" : "status"}
          className="flex items-start gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text shadow-lg"
        >
          {ICONS[toastItem.kind]}
          <p className="flex-1 break-words">{toastItem.message}</p>
          <button
            type="button"
            onClick={() => dismiss(toastItem.id)}
            aria-label="Dismiss"
            className="p-0.5 text-text-muted hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}