import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Circle,
} from "lucide-react";
import { useState } from "react";

import { formatDateTime } from "../../utils/claims";
import { getTimelineEventView } from "../../utils/timeline";
import { useTranslation } from "../../i18n/context";
import type { TimelineItem } from "../../types";
import StatusBadge from "../ui/StatusBadge";
import DetailSection from "./DetailSection";

// ─── Types ────────────────────────────────────────────────────────────────────

type EventState = "completed" | "current" | "failed";

function eventState(
  event: TimelineItem,
  index: number,
  total: number,
): EventState {
  const view = getTimelineEventView(event);
  if (view.isDecline) return "failed";
  if (index === total - 1) return "current";
  return "completed";
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const connectorClass: Record<EventState, string> = {
  completed: "bg-success-strong",
  current: "bg-primary",
  failed: "bg-warning-border-strong",
};

const dotWrapperClass: Record<EventState, string> = {
  completed:
    "bg-success-bg border-success-border text-success-text ring-2 ring-success-bg",
  current:
    "bg-primary-light border-primary/30 text-primary ring-4 ring-primary/10",
  failed:
    "bg-warning-bg border-warning-border-strong text-warning-text ring-2 ring-warning-bg",
};

const DotIcon: Record<EventState, typeof Check> = {
  completed: Check,
  current: Circle,
  failed: AlertTriangle,
};

// ─── Single event row ─────────────────────────────────────────────────────────

interface EventRowProps {
  event: TimelineItem;
  state: EventState;
  isLast: boolean;
}

function EventRow({ event, state, isLast }: EventRowProps) {
  const [expanded, setExpanded] = useState(state === "current");
  const { t } = useTranslation();

  const view = getTimelineEventView(event);
  const Icon = DotIcon[state];
  const hasDetails =
    view.details.length > 0 ||
    event.previousStatus != null ||
    event.newStatus != null;

  return (
    <li className="relative flex gap-4">
      {/* ── Connector + dot ─────────────────────────────────────────────── */}
      <div className="flex flex-col items-center shrink-0">
        <span
          className={[
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
            dotWrapperClass[state],
          ].join(" ")}
          aria-hidden="true"
        >
          <Icon size={13} />
        </span>
        {!isLast && (
          <span
            className={[
              "mt-1 w-0.5 flex-1 min-h-[1.5rem]",
              connectorClass[state],
            ].join(" ")}
            aria-hidden="true"
          />
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="pb-6 min-w-0 flex-1">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-text leading-snug">
              {event.action || t("timeline.unknownAction")}
            </span>

            {state === "failed" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-bg px-2 py-0.5 text-[11px] font-semibold text-warning-text">
                <AlertTriangle size={10} aria-hidden="true" />
                {t("timeline.declined")}
              </span>
            )}

            {event.role && (
              <span className="rounded-full bg-surface-sunken border border-border px-2 py-0.5 text-[11px] text-text-muted">
                {event.role}
              </span>
            )}
          </div>

          {/* Expand/collapse toggle when there are extra details */}
          {hasDetails && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label={
                expanded ? t("timeline.hideDetails") : t("timeline.showDetails")
              }
              className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {expanded ? (
                <ChevronUp size={14} aria-hidden="true" />
              ) : (
                <ChevronDown size={14} aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* Meta: performer + timestamp */}
        <p className="mt-1 text-xs text-text-muted">
          {event.performedBy?.name
            ? `${t("timeline.by")} ${event.performedBy.name}`
            : t("timeline.systemAction")}
          {" · "}
          {formatDateTime(event.timestamp)}
        </p>

        {/* Expandable detail block */}
        {hasDetails && expanded && (
          <div className="mt-3 rounded-lg border border-border bg-surface-sunken px-4 py-3 space-y-2">
            {/* Status transition */}
            {(event.previousStatus || event.newStatus) && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <span>{t("timeline.statusChange")}:</span>
                {event.previousStatus && (
                  <StatusBadge status={event.previousStatus} />
                )}
                {event.previousStatus && event.newStatus && (
                  <span aria-hidden="true" className="text-text-muted">→</span>
                )}
                {event.newStatus && (
                  <StatusBadge status={event.newStatus} />
                )}
              </div>
            )}

            {/* Structured detail fields (notes, reason, description…) */}
            {view.details.map((detail) => (
              <div key={detail.label}>
                <dt className="text-xs font-medium text-text-muted">
                  {detail.label}
                </dt>
                <dd className="mt-0.5 text-sm text-text">{detail.value}</dd>
              </div>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

// ─── ClaimTimeline ────────────────────────────────────────────────────────────

interface ClaimTimelineProps {
  timeline: TimelineItem[];
}

/**
 * ClaimTimeline — ordered audit log of every event on a claim.
 *
 * States per event:
 *   completed  — green dot + tick, completed connector
 *   current    — primary-coloured dot + circle (latest non-decline event)
 *   failed     — amber dot + warning icon (decline / correction events)
 *
 * Each event that carries extra fields (notes, reason, status change) renders
 * an expand/collapse toggle so the log stays scannable by default.
 */
export default function ClaimTimeline({ timeline }: ClaimTimelineProps) {
  const { t } = useTranslation();

  if (timeline.length === 0) {
    return (
      <DetailSection title={t("timeline.title")}>
        <p className="text-sm text-text-muted py-4 text-center">
          {t("timeline.empty")}
        </p>
      </DetailSection>
    );
  }

  const total = timeline.length;

  return (
    <DetailSection title={t("timeline.title")}>
      <ol
        aria-label={t("timeline.title")}
        className="space-y-0"
      >
        {timeline.map((event, index) => (
          <EventRow
            key={`${event.timestamp}-${index}`}
            event={event}
            state={eventState(event, index, total)}
            isLast={index === total - 1}
          />
        ))}
      </ol>
    </DetailSection>
  );
}
