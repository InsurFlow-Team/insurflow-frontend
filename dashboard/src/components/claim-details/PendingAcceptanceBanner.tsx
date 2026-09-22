import { Clock } from "lucide-react";

export default function PendingAcceptanceBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
      <Clock size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold">Awaiting adjuster reply</p>
        <p className="mt-0.5 text-blue-700">
          A field adjuster has been offered this claim. It will be assigned for
          inspection once they accept. No action is needed from the dashboard.
        </p>
      </div>
    </div>
  );
}