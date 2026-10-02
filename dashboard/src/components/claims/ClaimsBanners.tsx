import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ClaimsBannersProps {
  success?: string;
  error?: string;
}

export default function ClaimsBanners({ success, error }: ClaimsBannersProps) {
  return (
    <>
      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-success-border bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          <CheckCircle2 size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-deep"
        >
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </>
  );
}