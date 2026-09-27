import { Clock } from "lucide-react";

export default function PendingAcceptanceBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-info-border bg-info-bg p-4 text-sm text-info-deep">
      <Clock size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">Awaiting adjuster reply</p>
        <p className="mt-0.5 text-info-text">
          A field adjuster has been offered this claim. It will be assigned for
          inspection once they accept. No action is needed from the dashboard.
        </p>
      </div>
    </div>
  );
}