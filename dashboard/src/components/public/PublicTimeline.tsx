import { CheckCircle2, Clock } from "lucide-react";
import { formatDateTime } from "../../utils/claims";
import type { PublicTimelineEvent } from "../../types/publicTracking";

interface PublicTimelineProps {
  events: PublicTimelineEvent[];
}

export default function PublicTimeline({ events }: PublicTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted">
        <Clock size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">لا توجد أحداث بعد</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <TimelineEvent
          key={`${event.timestamp}-${index}`}
          event={event}
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  );
}

interface TimelineEventProps {
  event: PublicTimelineEvent;
  isLast: boolean;
}

function TimelineEvent({ event, isLast }: TimelineEventProps) {
  return (
    <div className="flex gap-4">
      {/* Icon & Line */}
      <div className="relative flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-strong text-white">
          <CheckCircle2 size={16} />
        </div>
        {!isLast && (
          <div className="absolute top-8 h-full w-0.5 bg-border" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-8">
        <p className="font-medium text-text">{event.action}</p>
        <p className="mt-0.5 text-sm text-text-muted">
          {formatDateTime(event.timestamp)}
        </p>
        {event.notes && (
          <p className="mt-2 text-sm text-text-muted rounded-lg bg-surface-secondary p-3">
            {event.notes}
          </p>
        )}
      </div>
    </div>
  );
}
