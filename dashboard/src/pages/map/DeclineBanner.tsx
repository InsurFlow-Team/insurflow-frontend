import { AlertTriangle } from "lucide-react";
import type { ClaimSummary } from "../../types";

interface DeclineBannerProps {
  decline: NonNullable<ClaimSummary["lastDecline"]>;
}

export default function DeclineBanner({ decline }: DeclineBannerProps) {
  return (
    <div className="p-3 rounded-lg bg-red-50 border border-danger/20 text-danger text-xs flex items-start gap-2">
      <AlertTriangle size={16} className="text-danger shrink-0 mt-0.5" />
      <div>
        <p className="font-bold text-danger">
          ⚠️ Re-dispatch Needed (تم الرفض سابقاً)
        </p>
        <p className="mt-0.5 text-text">
          Refused by:{" "}
          <span className="font-semibold">
            {decline.adjusterName || "Field Adjuster"}
          </span>
        </p>
        {decline.reason && (
          <p className="mt-0.5 italic text-text-muted">
            Reason: "{decline.reason}"
          </p>
        )}
      </div>
    </div>
  );
}