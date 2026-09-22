import { AlertCircle } from "lucide-react";

export default function ClaimIntakeBanner() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-light border border-primary/10">
      <AlertCircle size={18} className="text-primary mt-0.5 flex-shrink-0" />
      <div className="text-sm">
        <p className="font-medium text-primary mb-1">Required Information</p>
        <p className="text-text-muted">
          Provide customer, vehicle, and incident details. Assignment will be done separately via Map Dispatch.
        </p>
      </div>
    </div>
  );
}