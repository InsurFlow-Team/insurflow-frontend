import { Car, Calendar, FileText, Hash } from "lucide-react";
import type { PublicClaimDetails } from "../../types/publicTracking";

interface TrackingInfoCardProps {
  claim: PublicClaimDetails;
}

export default function TrackingInfoCard({ claim }: TrackingInfoCardProps) {
  const vehicleInfo = [claim.vehicleMake, claim.vehicleModel]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="rounded-xl border border-border bg-surface-primary p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-text">معلومات المطالبة</h2>

      <div className="space-y-4">
        {/* Claim Number */}
        <InfoRow
          icon={<Hash size={18} />}
          label="رقم المطالبة"
          value={claim.claimNumber}
        />

        {/* Vehicle */}
        {vehicleInfo && (
          <InfoRow
            icon={<Car size={18} />}
            label="المركبة"
            value={`${vehicleInfo} - ${claim.plateNumber}`}
          />
        )}

        {/* Incident Type */}
        <InfoRow
          icon={<FileText size={18} />}
          label="نوع الحادث"
          value={claim.incidentType}
        />

        {/* Incident Date */}
        {claim.incidentDate && (
          <InfoRow
            icon={<Calendar size={18} />}
            label="تاريخ الحادث"
            value={new Date(claim.incidentDate).toLocaleDateString("ar-SA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
        )}
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-text-muted">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-muted">{label}</p>
        <p className="mt-0.5 font-medium text-text break-words">{value}</p>
      </div>
    </div>
  );
}
