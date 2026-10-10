import { FileCheck2, PlayCircle, UserCheck } from "lucide-react";

import Button from "../ui/Button";
import { STALE_AFTER_DAYS, claimAgeInDays } from "../../utils/attention";
import { stageForStatus } from "../../domain/claimLifecycle";
import { useTranslation } from "../../i18n/context";
import type { MessageKey } from "../../i18n/messages.en";
import type { ClaimDetails, Role } from "../../types";

interface NextActionPanelProps {
  claim: ClaimDetails;
  role: Role | null;
  reviewing: boolean;
  onAssign: () => void;
  onStartReview: () => void;
  onMakeDecision: () => void;
}

/**
 * One panel that answers "who owns this claim, what's the SLA, what do I do
 * next" — the primary CTA for the claim's current state. Access rules mirror
 * the existing section actions exactly (assign = NEW + CO/ADMIN, start review
 * = SUBMITTED, decision = UNDER_REVIEW + ADMIN); nothing new is permitted or
 * removed here, only surfaced in one place.
 */
export default function NextActionPanel({
  claim,
  role,
  reviewing,
  onAssign,
  onStartReview,
  onMakeDecision,
}: NextActionPanelProps) {
  const { t, tp } = useTranslation();

  const stage = stageForStatus(claim.status);
  const assignedTo = claim.assignment.assignedTo;

  const canManageAssignment =
    role === "ADMIN" || role === "CLAIMS_OFFICER";
  const canAssign = claim.status === "NEW" && canManageAssignment;
  const canStartReview = claim.status === "SUBMITTED";
  const canDecide = claim.status === "UNDER_REVIEW" && role === "ADMIN";

  const WAITING_OWNER: Record<string, MessageKey> = {
    claims_officer: "owner.claimsOfficer",
    admin: "owner.admin",
    adjuster: "owner.adjuster",
  };
  const waitingLabel =
    stage.waitingOn === "none"
      ? null
      : t(WAITING_OWNER[stage.waitingOn] ?? "owner.claimsOfficer");

  const ageDays = claimAgeInDays(claim.createdAt);
  const slaText =
    ageDays >= STALE_AFTER_DAYS
      ? tp("sla.overdue", ageDays)
      : tp("sla.remaining", STALE_AFTER_DAYS - ageDays);

  return (
    <section
      aria-label={t("claim.nextAction")}
      data-testid="next-action-panel"
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="text-text-muted">{`${t("claim.owner")}: ${
          assignedTo?.name ?? t("claim.unassigned")
        }`}</span>

        <span
          className={
            ageDays >= STALE_AFTER_DAYS
              ? "font-medium text-danger"
              : "text-text-muted"
          }
        >{`${t("claim.slaLabel")}: ${slaText}`}</span>

        {waitingLabel && (
          <span className="text-text-muted">{`${t("claim.waitingOn")}: ${waitingLabel}`}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {canAssign && (
          <Button
            onClick={onAssign}
            icon={<UserCheck size={17} />}
            data-testid="next-action-cta"
          >
            {t("action.ASSIGN_ADJUSTER")}
          </Button>
        )}

        {canStartReview && (
          <Button
            onClick={onStartReview}
            loading={reviewing}
            icon={<PlayCircle size={17} />}
            data-testid="next-action-cta"
          >
            {t("action.START_REVIEW")}
          </Button>
        )}

        {canDecide && (
          <Button
            variant="secondary"
            onClick={onMakeDecision}
            icon={<FileCheck2 size={17} />}
            data-testid="next-action-cta"
          >
            {t("action.MAKE_DECISION")}
          </Button>
        )}

        {!canAssign && !canStartReview && !canDecide && (
          <p
            data-testid="next-action-none"
            className="text-sm text-text-muted"
          >
            {t("claim.noActionForYou")}
          </p>
        )}
      </div>
    </section>
  );
}
