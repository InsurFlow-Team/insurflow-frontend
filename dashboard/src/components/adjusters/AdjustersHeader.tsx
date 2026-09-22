import { ChevronRight } from "lucide-react";

interface AdjustersHeaderProps {
  pollingPaused?: boolean;
  showLiveBadge?: boolean;
}

export default function AdjustersHeader({
  pollingPaused = false,
  showLiveBadge = true,
}: AdjustersHeaderProps) {
  return (
    <div>
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-sm text-text-muted"
      >
        <span>Operations</span>
        <ChevronRight size={14} className="text-text-muted" />
        <span className="font-medium text-primary">
          Field Adjusters Directory
        </span>
      </nav>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl lg:text-3xl font-bold text-text">
          Field Adjusters Directory
        </h1>

        {showLiveBadge && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
            <span
              className={`h-2 w-2 rounded-full bg-emerald-500 ${pollingPaused ? "" : "animate-pulse"}`}
              aria-hidden="true"
            />
            {pollingPaused ? "Live Sync Paused" : "Live Synced"}
          </span>
        )}
      </div>

      <p className="mt-1 text-sm text-text-muted max-w-2xl">
        Monitor field adjusters availability, workload, and status across the
        fleet.
      </p>
    </div>
  );
}