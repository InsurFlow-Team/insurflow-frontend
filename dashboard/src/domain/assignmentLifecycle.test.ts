import { describe, expect, it } from "vitest";

import {
  ASSIGNMENT_STAGES,
  assignmentStageByKey,
  assignmentStageFor,
  isReassignable,
} from "./assignmentLifecycle";
import { ALL_CLAIM_STATUSES } from "../utils/claims";

describe("assignmentLifecycle", () => {
  it("returns NOT_ASSIGNED for a fresh claim and DECLINED after a decline", () => {
    expect(
      assignmentStageFor({ status: "NEW", hasAssignee: false }).key,
    ).toBe("NOT_ASSIGNED");

    expect(
      assignmentStageFor({
        status: "NEW",
        hasAssignee: false,
        declined: true,
      }).key,
    ).toBe("DECLINED");
  });

  it("follows the verified backend transitions", () => {
    expect(
      assignmentStageFor({ status: "PENDING_ACCEPTANCE", hasAssignee: true })
        .key,
    ).toBe("WAITING_ACCEPTANCE");
    expect(
      assignmentStageFor({ status: "ASSIGNED", hasAssignee: true }).key,
    ).toBe("ACCEPTED");
    expect(
      assignmentStageFor({ status: "IN_PROGRESS", hasAssignee: true }).key,
    ).toBe("INSPECTION_IN_PROGRESS");
    expect(
      assignmentStageFor({ status: "CORRECTION_REQUIRED", hasAssignee: true })
        .key,
    ).toBe("CORRECTION_REQUESTED");
  });

  it("treats every post-inspection state as COMPLETED", () => {
    for (const status of [
      "SUBMITTED",
      "UNDER_REVIEW",
      "APPROVED",
      "REJECTED",
      "CLOSED",
    ] as const) {
      expect(assignmentStageFor({ status, hasAssignee: true }).key).toBe(
        "COMPLETED",
      );
    }
  });

  it("covers every backend status at least once", () => {
    const covered = new Set(
      ASSIGNMENT_STAGES.flatMap((stage) => stage.claimStatuses),
    );

    for (const status of ALL_CLAIM_STATUSES) {
      expect(covered.has(status)).toBe(true);
    }
    expect(new Set(ASSIGNMENT_STAGES.map((s) => s.key)).size).toBe(
      ASSIGNMENT_STAGES.length,
    );
    expect(assignmentStageByKey("DECLINED").hasAdjuster).toBe(false);
    expect(assignmentStageByKey("WAITING_ACCEPTANCE").hasAdjuster).toBe(true);
  });

  it("only allows re-assignment from NEW (backend rejects any other status)", () => {
    expect(isReassignable("NEW")).toBe(true);
    expect(isReassignable("PENDING_ACCEPTANCE")).toBe(false);
    expect(isReassignable("ASSIGNED")).toBe(false);
    expect(isReassignable("IN_PROGRESS")).toBe(false);
  });
});
