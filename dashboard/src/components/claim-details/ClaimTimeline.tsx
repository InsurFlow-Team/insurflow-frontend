import { formatDateTime } from "../../utils/claims";
import { getTimelineEventView } from "../../utils/timeline";
import DetailSection from "./DetailSection";

interface ClaimTimelineProps {
  timeline: Array<Record<string, unknown>>;
}

export default function ClaimTimeline({ timeline }: ClaimTimelineProps) {
  const sortedTimeline = [...timeline].sort(
    (firstEvent, secondEvent) =>
      new Date(String(secondEvent.timestamp ?? "")).getTime() -
      new Date(String(firstEvent.timestamp ?? "")).getTime(),
  );

  return (
    <DetailSection title="Claim Timeline">
      {sortedTimeline.length === 0 ? (
        <p className="text-sm text-text-muted">
          No timeline events available.
        </p>
      ) : (
        <div className="space-y-4">
          {sortedTimeline.map((event, index) => {
            const view = getTimelineEventView(event);
            const performedBy = event.performedBy as {
              name?: string;
            } | null;

            return (
              <div
                key={`${String(event.timestamp)}-${index}`}
                className={`border-l-2 pl-4 ${
                  view.isDecline ? "border-amber-400" : "border-primary"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-text">
                    {view.action}
                  </p>

                  {view.isDecline && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      Declined
                    </span>
                  )}
                </div>

                {view.details.length > 0 && (
                  <div className="mt-1.5 space-y-0.5">
                    {view.details.map((detail) => (
                      <p key={detail.label} className="text-sm text-text">
                        <span className="font-medium text-text-muted">
                          {detail.label}:{" "}
                        </span>
                        {detail.value}
                      </p>
                    ))}
                  </div>
                )}

                <p className="mt-1.5 text-xs text-text-muted">
                  Performed by: {performedBy?.name ?? "Unknown user"}
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  {formatDateTime(String(event.timestamp ?? ""))}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </DetailSection>
  );
}