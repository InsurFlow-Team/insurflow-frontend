import { Car } from "lucide-react";
import type { VehicleInfo } from "../../types";

interface InfoRowProps {
  label: string;
  value?: string | number | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm text-text">{value ?? "—"}</p>
    </div>
  );
}

interface VehicleInfoCardProps {
  vehicle: VehicleInfo;
}

export default function VehicleInfoCard({ vehicle }: VehicleInfoCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <Car size={18} className="text-primary shrink-0" />
        <h2 className="text-lg font-semibold text-text">Vehicle Information</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <InfoRow label="Plate Number" value={vehicle.plateNumber} />
        <InfoRow label="Make"         value={vehicle.make} />
        <InfoRow label="Model"        value={vehicle.model} />
        <InfoRow label="Year"         value={vehicle.year} />
        <InfoRow label="Color"        value={vehicle.color} />
        <InfoRow label="Vehicle ID"   value={vehicle.vehicleId} />
      </div>
    </section>
  );
}
