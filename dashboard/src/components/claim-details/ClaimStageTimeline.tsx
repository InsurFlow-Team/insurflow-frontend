import { AlertTriangle, Check, XCircle } from "lucide-react";

import { CLAIM_STAGES, stageForStatus } from "../../domain/claimLifecycle";
import { useTranslation } from "../../i18n/context";
import type { MessageKey } from "../../i18n/messages.en";
import type { ClaimStatus } from "../../types";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepState = "done" | "current" | "upcoming" | "failed";

// ─── Style maps ───────────────────────────────────────────────────────────────

const stepCircle: Record<StepState, string> = {
  done: [
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
    "bg-success-strong text-white",
    "ring-2 ring-success-bg",
  ].join(" "),

  current: [
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
    "bg-primary text-white",
    "ring-4 ring-primary/15",
  ].join(" "),

  upcoming: [
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
    "border border-border bg-surface text-text-muted",
  ].join(" "),

  failed: [
    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
    "bg-danger-bg border border-danger-border text-danger",
    "ring-2 ring-danger-bg",
  ].join(" "),
};

const stepLabel: Record<StepState, string> = {
  done: "text-xs text-text whitespace-nowrap",
  current: "text-xs font-semibold text-text whitespace-nowrap",
  upcoming: "text-xs text-text-muted whitespace-nowrap",
  failed: "text-xs font-semibold text-danger whitespace-nowrap",
};

const connectorClass: Record<StepState, string> = {
  done: "bg-success-strong/60",
  current: "bg-primary/30",
  upcoming: "bg-border",
  failed: "bg-danger-border",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StepIconProps {
  state: StepState;
  index: number;
}

function StepIcon({ state, index }: StepIconProps) {
  switch (state) {
    case "done":
      return <Check size={14} aria-hidden="true" />;
    case "current":
      return (
        <span className="text-xs font-bold" aria-hidden="true">
          {index + 1}
        </span>
      );
    case "failed":
      return <XCircle size={14} aria-hidden="true" />;
    case "upcoming":
      return (
        <span className="text-xs font-medium" aria-hidden="true">
          {index + 1}
        </span>
      );
  }
}

// ─── ClaimStageTimeline ───────────────────────────────────────────────────────

interface ClaimStageTimelineProps {
  status: ClaimStatus;
}

/**
 * ClaimStageTimeline — horizontal progress tracker for the claim lifecycle.
 *
 * Step states:
 *   done      — green tick, completed connector
 *   current   — navy filled circle with ring, partial connector
 *   upcoming  — grey outlined circle with step number
 *   failed    — red circle with X icon (REJECTED / CORRECTION_REQUIRED)
 *
 * Only stages with `availableInBackend: true` are shown — proposed stages
 * are excluded so the tracker never invents steps. The current stage is
 * marked with `aria-current="step"` and announced to screen readers with
 * its full label.
 *
 * Exception stages (REJECTED, APPROVED, CLOSED) are always shown at the end
 * so terminal states are visually clear even when the linear order ends.
 */
export default function ClaimStageTimeline({ status }: ClaimStageTimelineProps) {
  const { t } = useTranslation();

  const steps = CLAIM_STAGES.filter((s) => s.availableInBackend).sort(
    (a, b) => a.order - b.order,
  );

  const currentKey = stageForStatus(status).key;
  const currentIndex = steps.findIndex((s) => s.key === currentKey);

  // Whether the claim ended in a failed/exception branch
  const isFailed =
    status === "REJECTED" ||
    status === "CORRECTION_REQUIRED";

  return (
    <nav
      aria-label={t("claim.progress")}
      data-testid="stage-timeline"
      className="rounded-xl border border-border bg-surface px-5 py-4 shadow-sm overflow-x-auto"
    >
      <ol className="flex items-center min-w-max gap-0">
        {steps.map((stage, index) => {
          // Compute display state
          let state: StepState;
          if (index < currentIndex) {
            state = "done";
          } else if (index === currentIndex) {
            state = isFailed ? "failed" : "current";
          } else {
            state = "upcoming";
          }

          const isLast = index === steps.length - 1;
          // Connector state mirrors the PREVIOUS step's state
          const connectorState: StepState =
            index > 0 && index <= currentIndex ? "done" : "upcoming";

          return (
            <li
              key={stage.key}
              data-testid="stage-step"
              data-state={state}
              data-stage={stage.key}
              aria-current={state === "current" ? "step" : undefined}
              className="flex items-center"
            >
              {/* Connector line before this step (not before the first) */}
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className={[
                    "h-px w-8 shrink-0 transition-colors",
                    connectorClass[connectorState],
                  ].join(" ")}
                />
              )}

              {/* Step */}
              <span className="flex flex-col items-center gap-1.5">
                <span
                  className={stepCircle[state]}
                  aria-hidden="true"
                >
                  <StepIcon state={state} index={index} />
                </span>

                <span className={stepLabel[state]}>
                  {/* Screen reader gets the full "Step N: Label" context */}
                  <span className="sr-only">
                    {state === "current"
                      ? `${t("claim.progress")} — `
                      : ""}
                  </span>
                  {t(stage.labelKey as MessageKey)}
                </span>
              </span>

              {/* Warning triangle below label for overdue/failed current step */}
              {state === "failed" && !isLast && (
                <span aria-hidden="true" className="ms-1 text-danger">
                  <AlertTriangle size={12} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
