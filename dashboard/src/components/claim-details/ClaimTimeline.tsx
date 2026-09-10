import { formatDateTime } from "../../utils/claims";
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
            const performedBy = event.performedBy as {
              name?: string;
            } | null;

            return (
              <div
                key={`${String(event.timestamp)}-${index}`}
                className="border-l-2 border-primary pl-4"
              >
                <p className="text-sm font-semibold text-text">
                  {String(event.action ?? "Unknown action")}
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  User: {performedBy?.name ?? "Unknown user"}
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