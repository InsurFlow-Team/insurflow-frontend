import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  /** Renders as a slim inline row instead of a large centered block. */
  inline?: boolean;
}

export default function LoadingState({
  message = "Loading...",
  inline = false,
}: LoadingStateProps) {
  if (inline) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-4 shadow-sm">
        <Loader2 size={18} className="animate-spin text-primary shrink-0" />
        <p className="text-sm text-text-muted">{message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
      <Loader2 size={32} className="animate-spin text-primary" />
      <p className="text-sm">{message}</p>
    </div>
  );
}