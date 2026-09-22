import { Users } from "lucide-react";
import { formatCapacitySummary } from "../../utils/adjusters";
import type { FieldAdjuster } from "../../types";

interface AdjustersListProps {
  adjusters: FieldAdjuster[];
  loading: boolean;
}

function AdjusterRow({ adjuster }: { adjuster: FieldAdjuster }) {
  const busy = adjuster.availability === "UNAVAILABLE";

  return (
    <div className="p-2.5 rounded-lg border border-border bg-background text-xs space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-text">
          {adjuster.name} ({adjuster.employeeCode})
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
            busy
              ? "bg-red-50 text-danger border border-danger/20"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {busy ? "Busy" : "Available"}
        </span>
      </div>

      <div className="flex items-center justify-between text-text-muted text-[11px]">
        <span>Tasks: {formatCapacitySummary(adjuster) ?? "0"}</span>
        {typeof adjuster.distanceKm === "number" ? (
          <span className="font-medium text-primary">
            {adjuster.distanceKm.toFixed(2)} km
          </span>
        ) : (
          <span className="text-text-muted">Distance unavailable</span>
        )}
      </div>
    </div>
  );
}

export default function AdjustersList({
  adjusters,
  loading,
}: AdjustersListProps) {
  return (
    <div className="pt-2 border-t border-border">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-text flex items-center gap-1">
          <Users size={14} className="text-primary" />
          Available Adjusters ({adjusters.length})
        </p>
        {loading && (
          <span className="text-[10px] text-text-muted animate-pulse">
            Sorting by proximity...
          </span>
        )}
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
        {adjusters.length === 0 ? (
          <p className="text-xs text-text-muted italic">
            No active adjusters available.
          </p>
        ) : (
          adjusters.map((adj) => <AdjusterRow key={adj.id} adjuster={adj} />)
        )}
      </div>
    </div>
  );
}