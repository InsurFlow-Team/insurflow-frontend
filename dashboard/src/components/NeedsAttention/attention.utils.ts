import {
  ATTENTION_GROUPS,
  STALE_AFTER_DAYS,
  claimAgeInDays,
  isOverdue,
  type AttentionGroupDefinition,
} from "../../utils/attention";

import { isActionAvailableFor } from "../../domain/actions";

import type { MessageKey } from "../../i18n/messages.en";
import type { ClaimSummary, Role } from "../../types";
import type { RowToneKey } from "./attention.styles";

export const MAX_VISIBLE_ROWS = 6;

export const WAITING_LABEL: Record<
  AttentionGroupDefinition["waitingOn"],
  MessageKey
> = {
  officer: "attention.waitingOnOfficer",
  adjuster: "attention.waitingOnAdjuster",
  admin: "attention.waitingOnAdmin",
};

export function toneKeyFor(
  def: AttentionGroupDefinition,
  overdue: boolean,
): RowToneKey {
  if (overdue) return "overdue";

  return def.waitingOn;
}

export interface AttentionRowData {
  claim: ClaimSummary;
  def: AttentionGroupDefinition;
  ageDays: number;
  overdue: boolean;
  remainingDays: number;
  tone: RowToneKey;
}

export function primaryActionFor(
  claim: ClaimSummary,
  role: Role | null,
): { labelKey: MessageKey; to: string } | null {
  const status = claim.status;

  if (
    status === "NEW" &&
    isActionAvailableFor("ASSIGN_ADJUSTER", { status, role })
  ) {
    return { labelKey: "action.ASSIGN_ADJUSTER", to: `/map?claim=${claim.id}` };
  }
  if (
    status === "SUBMITTED" &&
    isActionAvailableFor("START_REVIEW", { status, role })
  ) {
    return { labelKey: "action.START_REVIEW", to: `/claims/${claim.id}` };
  }
  if (
    status === "UNDER_REVIEW" &&
    isActionAvailableFor("APPROVE_CLAIM", { status, role })
  ) {
    return { labelKey: "action.MAKE_DECISION", to: `/claims/${claim.id}` };
  }
  return null;
}

export function buildAttentionRows(claims: ClaimSummary[]): AttentionRowData[] {
  return claims
    .flatMap((claim) => {
      const def = ATTENTION_GROUPS.find(
        (group) => group.status === claim.status,
      );

      if (!def) return [];

      const ageDays = claimAgeInDays(claim.createdAt);
      const overdue = isOverdue(claim.createdAt);

      return [
        {
          claim,
          def,
          ageDays,
          overdue,
          remainingDays: Math.max(0, STALE_AFTER_DAYS - ageDays),
          tone: toneKeyFor(def, overdue),
        },
      ];
    })
    .sort(
      (a, b) => Number(b.overdue) - Number(a.overdue) || b.ageDays - a.ageDays,
    );
}


