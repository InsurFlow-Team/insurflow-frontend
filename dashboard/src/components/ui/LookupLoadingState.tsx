import { Loader2 } from "lucide-react";

interface LookupLoadingStateProps {
  message?: string;
}

export default function LookupLoadingState({
  message = "Looking up information...",
}: LookupLoadingStateProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-4 shadow-sm">
      <Loader2 size={18} className="animate-spin text-primary shrink-0" />
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  );
}
