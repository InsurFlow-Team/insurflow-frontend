import { formatDateTime } from "../../utils/claims";
import { getTimelineEventView } from "../../utils/timeline";
import DetailSection from "./DetailSection";
import type { TimelineItem } from "../../types";

interface ClaimTimelineProps {
  timeline: TimelineItem[];
}

export default function ClaimTimeline({ timeline }: ClaimTimelineProps) {
  if (timeline.length === 0) {
    return (
      <DetailSection title="Claim Timeline">
        <p className="text-sm text-text-muted">
          No timeline events available.
        </p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="Claim Timeline">
      <div className="space-y-4">
        {timeline.map((event, index) => {
          const view = getTimelineEventView(event);

          return (
            <div
              key={`${event.timestamp}-${index}`}
              className={`border-l-2 pl-4 ${
                view.isDecline ? "border-amber-400" : "border-primary"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-text">
                  {event.action || "Unknown action"}
                </p>

                {view.isDecline && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    Declined
                  </span>
                )}

                {event.role && (
                  <span className="rounded-full bg-surface-soft px-2 py-0.5 text-xs text-text-muted">
                    {event.role}
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

              {(event.previousStatus || event.newStatus) && (
                <p className="mt-1.5 text-sm text-text">
                  <span className="font-medium text-text-muted">
                    Status:{" "}
                  </span>
                  <span>
                    {event.previousStatus ? `${event.previousStatus} → ` : ""}
                    {event.newStatus || "—"}
                  </span>
                </p>
              )}

              <p className="mt-1.5 text-xs text-text-muted">
                Performed by: {event.performedBy?.name ?? "—"}
              </p>

              <p className="mt-1 text-xs text-text-muted">
                {formatDateTime(event.timestamp)}
              </p>
            </div>
          );
        })}
      </div>
    </DetailSection>
  );
}