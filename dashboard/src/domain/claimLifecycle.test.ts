import { describe, expect, it } from "vitest";

import {
  CLAIM_STAGES,
  CLAIM_TRANSITIONS,
  STAGE_BY_KEY,
  STAGE_FOR_STATUS,
  isFinalDecisionStatus,
  isKnownTransition,
  isStageAvailableInBackend,
  stageByKey,
  stageForStatus,
  stagesInPhase,
  stagesWithoutBackendSupport,
} from "./claimLifecycle";
import { ALL_CLAIM_STATUSES } from "../utils/claims";

describe("claimLifecycle", () => {
  it("maps every backend status to exactly one product stage", () => {
    expect(Object.keys(STAGE_FOR_STATUS).sort()).toEqual(
      [...ALL_CLAIM_STATUSES].sort(),
    );

    for (const status of ALL_CLAIM_STATUSES) {
      expect(stageForStatus(status).backendStatuses).toContain(status);
      expect(stageForStatus(status).availableInBackend).toBe(true);
    }
  });

  it("resolves the naming trap: product ASSIGNED ≠ backend ASSIGNED", () => {
    // Offered, waiting for the adjuster = product AWAITING_ACCEPTANCE.
    expect(stageForStatus("PENDING_ACCEPTANCE").key).toBe(
      "AWAITING_ACCEPTANCE",
    );
    // Backend ASSIGNED means the adjuster said yes.
    expect(stageForStatus("ASSIGNED").key).toBe("ACCEPTED");
  });

  it("keeps the correction loop and final states distinct", () => {
    expect(stageForStatus("CORRECTION_REQUIRED").key).toBe(
      "CORRECTION_REQUIRED",
    );
    expect(stageForStatus("UNDER_REVIEW").key).toBe("UNDER_DECISION");
    expect(stageForStatus("APPROVED").key).toBe("APPROVED");
    expect(stageForStatus("CLOSED").key).toBe("CLOSED");
  });

  it("lists proposed stages the backend cannot produce", () => {
    const unsupported = stagesWithoutBackendSupport().map((stage) => stage.key);

    expect(unsupported).toEqual([
      "NEW",
      "INTAKE_REVIEW",
      "ON_HOLD",
      "CANCELLED",
    ]);

    for (const key of unsupported) {
      expect(isStageAvailableInBackend(key)).toBe(false);
      expect(stageByKey(key).backendStatuses).toEqual([]);
    }
  });

  it("keeps stage metadata consistent", () => {
    const orders = CLAIM_STAGES.map((stage) => stage.order);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(new Set(CLAIM_STAGES.map((stage) => stage.key)).size).toBe(
      CLAIM_STAGES.length,
    );
    expect(stagesInPhase("dispatch").map((stage) => stage.key)).toEqual([
      "READY_FOR_ASSIGNMENT",
      "AWAITING_ACCEPTANCE",
    ]);
    expect(STAGE_BY_KEY.UNDER_DECISION.waitingOn).toBe("admin");
  });

  it("only recognises transitions the backend actually performs", () => {
    expect(isKnownTransition(null, "NEW")).toBe(true);
    expect(isKnownTransition("NEW", "PENDING_ACCEPTANCE")).toBe(true);
    expect(isKnownTransition("PENDING_ACCEPTANCE", "ASSIGNED")).toBe(true);
    expect(isKnownTransition("PENDING_ACCEPTANCE", "NEW")).toBe(true);
    expect(isKnownTransition("UNDER_REVIEW", "APPROVED")).toBe(true);

    // Jumping stages never happens.
    expect(isKnownTransition("NEW", "APPROVED")).toBe(false);
    expect(isKnownTransition("PENDING_ACCEPTANCE", "IN_PROGRESS")).toBe(false);
    expect(isKnownTransition("SUBMITTED", "APPROVED")).toBe(false);
    // No observed writer for these two.
    expect(isKnownTransition("SUBMITTED", "CORRECTION_REQUIRED")).toBe(false);
    expect(isKnownTransition("APPROVED", "CLOSED")).toBe(false);
    expect(CLAIM_TRANSITIONS).toHaveLength(9);
  });

  it("flags final decision statuses", () => {
    expect(isFinalDecisionStatus("APPROVED")).toBe(true);
    expect(isFinalDecisionStatus("REJECTED")).toBe(true);
    expect(isFinalDecisionStatus("CLOSED")).toBe(true);
    expect(isFinalDecisionStatus("UNDER_REVIEW")).toBe(false);
    expect(isFinalDecisionStatus("NEW")).toBe(false);
  });
});
