import { AlertCircle } from "lucide-react";
import Button from "./Button";

interface LookupErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function LookupErrorState({
  message = "Failed to retrieve information. Please try again.",
  onRetry,
}: LookupErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-danger/20 bg-red-50 px-6 py-10 text-center">
      <AlertCircle size={24} className="text-danger shrink-0" />
      <p className="text-sm font-medium text-danger">Lookup Failed</p>
      <p className="text-sm text-text-muted max-w-xs">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
