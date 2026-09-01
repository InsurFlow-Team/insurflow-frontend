import { CarFront } from "lucide-react";

interface VehicleNotFoundStateProps {
  plateNumber?: string | null;
}

export default function VehicleNotFoundState({
  plateNumber,
}: VehicleNotFoundStateProps) {
  const description = plateNumber
    ? `No vehicle was found for plate number "${plateNumber}".`
    : "No vehicle was found for the provided plate number.";

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface px-6 py-10 shadow-sm text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background">
        <CarFront size={24} className="text-text-muted opacity-60" />
      </span>
      <p className="text-sm font-medium text-text">Vehicle Not Found</p>
      <p className="text-sm text-text-muted max-w-xs">{description}</p>
    </div>
  );
}
