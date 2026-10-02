import { describe, expect, it } from "vitest";

import {
  computeDurationHours,
  countInspections,
  formatDuration,
  isCompletedStatus,
  resolveCompletedAt,
  selectCompletedClaims,
  summarizeWorkHistory,
  toWorkHistoryEntry,
} from "./adjusterHistory";
import type { ClaimDetails, ClaimSummary, TimelineItem } from "../types";

const ADJUSTER_ID = "adj-1";

function summary(
  overrides: Partial<ClaimSummary> & Pick<ClaimSummary, "id">,
): ClaimSummary {
  return {
    claimNumber: `CLM-${overrides.id}`,
    status: "APPROVED",
    customerName: "John Doe",
    initialPlateNumber: "ABC-1234",
    createdAt: "2026-09-20T10:00:00.000Z",
    assignedTo: { id: ADJUSTER_ID, name: "Ahmed", employeeCode: "FA-001" },
    ...overrides,
  };
}

function event(
  action: string,
  timestamp: string,
  performedBy: string | null = ADJUSTER_ID,
): TimelineItem {
  return {
    action,
    previousStatus: null,
    newStatus: null,
    notes: null,
    performedBy: performedBy
      ? { id: performedBy, name: performedBy, employeeCode: "FA-001" }
      : null,
    role: "FIELD_ADJUSTER",
    timestamp,
  };
}

function details(overrides: Partial<ClaimDetails> = {}): ClaimDetails {
  return {
    id: "clm-1",
    claimNumber: "CLM-1",
    status: "APPROVED",
    incidentType: "COLLISION",
    incidentLocation: "Ramallah",
    incidentCoordinates: null,
    createdAt: "2026-09-20T10:00:00.000Z",
    updatedAt: "2026-09-25T13:00:00.000Z",
    customer: { name: "John Doe", phone: null },
    vehicle: {
      plateNumber: "ABC-1234",
      make: null,
      model: null,
      year: null,
      color: null,
    },
    policy: null,
    assignment: { assignedTo: null, assignedBy: null, assignedAt: null, priority: null, assignmentNotes: null },
    accident: null,
    location: null,
    evidence: [],
    signature: null,
    decisionNotes: null,
    closedBy: null,
    closedAt: null,
    closingNotes: null,
    timeline: [],
    createdBy: null,
    ...overrides,
  };
}

describe("isCompletedStatus", () => {
  it("counts approved, rejected and closed as completed", () => {
    expect(isCompletedStatus("APPROVED")).toBe(true);
    expect(isCompletedStatus("REJECTED")).toBe(true);
    expect(isCompletedStatus("CLOSED")).toBe(true);
  });

  it("does not count work that is still open", () => {
    expect(isCompletedStatus("IN_PROGRESS")).toBe(false);
    expect(isCompletedStatus("SUBMITTED")).toBe(false);
    expect(isCompletedStatus("UNDER_REVIEW")).toBe(false);
    expect(isCompletedStatus("NEW")).toBe(false);
  });

  it("tolerates missing and unknown statuses", () => {
    expect(isCompletedStatus(null)).toBe(false);
    expect(isCompletedStatus(undefined)).toBe(false);
    expect(isCompletedStatus("SOMETHING_ELSE")).toBe(false);
  });
});

describe("selectCompletedClaims", () => {
  it("keeps only this adjuster's completed claims, most recent first", () => {
    const claims: ClaimSummary[] = [
      summary({ id: "a", updatedAt: "2026-09-21T10:00:00.000Z" }),
      summary({ id: "b", updatedAt: "2026-09-25T10:00:00.000Z" }),
      summary({ id: "c", status: "IN_PROGRESS", updatedAt: "2026-09-26T10:00:00.000Z" }),
      summary({
        id: "d",
        status: "CLOSED",
        updatedAt: "2026-09-22T10:00:00.000Z",
        assignedTo: { id: "adj-2", name: "Second", employeeCode: "FA-002" },
      }),
      summary({ id: "e", status: "REJECTED", updatedAt: "2026-09-23T10:00:00.000Z", assignedTo: null }),
    ];

    expect(selectCompletedClaims(claims, ADJUSTER_ID).map((c) => c.id)).toEqual([
      "b",
      "a",
    ]);
  });

  it("returns nothing without an adjuster id", () => {
    expect(selectCompletedClaims([summary({ id: "a" })], "")).toEqual([]);
  });
});

describe("countInspections", () => {
  it("counts every inspection start so revisits add up", () => {
    const timeline = [
      event("Assignment Accepted", "2026-09-24T19:48:06.392Z"),
      event("Inspection Started", "2026-09-24T19:49:25.736Z"),
      event("Evidence Uploaded", "2026-09-25T13:43:47.160Z"),
      event("Inspection Started", "2026-09-25T09:00:00.000Z"),
    ];

    expect(countInspections(timeline, ADJUSTER_ID)).toBe(2);
  });

  it("ignores inspections performed by somebody else", () => {
    const timeline = [
      event("Inspection Started", "2026-09-24T19:49:25.736Z"),
      event("Inspection Started", "2026-09-25T09:00:00.000Z", "adj-2"),
    ];

    expect(countInspections(timeline, ADJUSTER_ID)).toBe(1);
  });

  it("returns zero when there is no timeline", () => {
    expect(countInspections(null, ADJUSTER_ID)).toBe(0);
    expect(countInspections(undefined, ADJUSTER_ID)).toBe(0);
    expect(countInspections([], ADJUSTER_ID)).toBe(0);
  });
});

describe("resolveCompletedAt", () => {
  it("prefers closedAt for a settled claim", () => {
    expect(
      resolveCompletedAt(details({ closedAt: "2026-09-25T13:51:00.847Z" })),
    ).toBe("2026-09-25T13:51:00.847Z");
  });

  it("falls back to the decision event when the claim is not closed", () => {
    const claimDetails = details({
      status: "APPROVED",
      closedAt: null,
      timeline: [
        event("Claim Created", "2026-09-24T17:58:56.989Z"),
        event("Claim Approved", "2026-09-25T13:50:16.228Z"),
      ],
    });

    expect(resolveCompletedAt(claimDetails)).toBe("2026-09-25T13:50:16.228Z");
  });

  it("returns null when the claim carries no completion event", () => {
    expect(resolveCompletedAt(details({ closedAt: null, timeline: [] }))).toBeNull();
  });

  it("returns null when the claim details are unavailable", () => {
    expect(resolveCompletedAt(null)).toBeNull();
  });
});

describe("computeDurationHours", () => {
  it("measures assignment to completion", () => {
    expect(
      computeDurationHours("2026-09-24T19:45:24.032Z", "2026-09-25T13:51:00.847Z"),
    ).toBeCloseTo(18.09, 2);
  });

  it("returns null when either side is missing or inverted", () => {
    expect(computeDurationHours(null, "2026-09-25T13:51:00.847Z")).toBeNull();
    expect(computeDurationHours("2026-09-24T19:45:24.032Z", null)).toBeNull();
    expect(computeDurationHours("not-a-date", "2026-09-25T13:51:00.847Z")).toBeNull();
    expect(computeDurationHours("2026-09-25T13:51:00.847Z", "2026-09-24T19:45:24.032Z")).toBeNull();
  });
});

describe("formatDuration", () => {
  it("renders minutes, hours, days and their combinations", () => {
    expect(formatDuration(0.25)).toBe("15m");
    expect(formatDuration(1)).toBe("1h");
    expect(formatDuration(1.5)).toBe("1h 30m");
    expect(formatDuration(25)).toBe("1d 1h");
    expect(formatDuration(48)).toBe("2d");
  });

  it("renders an em dash for unknown durations", () => {
    expect(formatDuration(null)).toBe("—");
    expect(formatDuration(-1)).toBe("—");
    expect(formatDuration(Number.NaN)).toBe("—");
  });
});

describe("toWorkHistoryEntry", () => {
  it("builds a full entry from the claim timeline", () => {
    const claim = summary({ id: "a", status: "CLOSED" });
    const claimDetails = details({
      status: "CLOSED",
      closedAt: "2026-09-25T13:51:00.847Z",
      assignment: {
        assignedTo: null,
        assignedBy: null,
        assignedAt: "2026-09-24T19:45:24.032Z",
        priority: "HIGH",
        assignmentNotes: null,
      },
      evidence: [
        {
          imageType: "DAMAGE_CLOSEUP",
          url: "https://example.com/1.jpg",
          uploadedBy: null,
          uploadedAt: "2026-09-25T13:43:47.160Z",
        },
      ],
      timeline: [
        event("Inspection Started", "2026-09-24T19:49:25.736Z"),
        event("Inspection Started", "2026-09-25T09:00:00.000Z"),
      ],
    });

    expect(toWorkHistoryEntry(claim, claimDetails, ADJUSTER_ID)).toMatchObject({
      claimId: "a",
      claimNumber: "CLM-a",
      status: "CLOSED",
      customerName: "John Doe",
      plateNumber: "ABC-1234",
      inspectionCount: 2,
      evidenceCount: 1,
      completedAt: "2026-09-25T13:51:00.847Z",
    });
    expect(
      toWorkHistoryEntry(claim, claimDetails, ADJUSTER_ID).durationHours,
    ).toBeCloseTo(18.09, 2);
  });

  it("reports no numbers rather than guessing when details are missing", () => {
    const entry = toWorkHistoryEntry(summary({ id: "a" }), null, ADJUSTER_ID);

    expect(entry.inspectionCount).toBeNull();
    expect(entry.evidenceCount).toBeNull();
    expect(entry.completedAt).toBeNull();
    expect(entry.durationHours).toBeNull();
    expect(entry.claimNumber).toBe("CLM-a");
  });
});

describe("summarizeWorkHistory", () => {
  it("totals the completed count, inspections and average turnaround", () => {
    const entries = [
      toWorkHistoryEntry(
        summary({ id: "a" }),
        details({
          closedAt: "2026-09-25T13:51:00.847Z",
          assignment: {
            assignedTo: null,
            assignedBy: null,
            assignedAt: "2026-09-24T13:51:00.847Z",
            priority: null,
            assignmentNotes: null,
          },
          timeline: [event("Inspection Started", "2026-09-24T14:00:00.000Z")],
        }),
        ADJUSTER_ID,
      ),
      toWorkHistoryEntry(
        summary({ id: "b" }),
        details({
          closedAt: "2026-09-23T13:51:00.847Z",
          assignment: {
            assignedTo: null,
            assignedBy: null,
            assignedAt: "2026-09-21T13:51:00.847Z",
            priority: null,
            assignmentNotes: null,
          },
          timeline: [
            event("Inspection Started", "2026-09-21T14:00:00.000Z"),
            event("Inspection Started", "2026-09-22T14:00:00.000Z"),
          ],
        }),
        ADJUSTER_ID,
      ),
    ];

    const totals = summarizeWorkHistory(entries, 2);

    expect(totals.completedCount).toBe(2);
    expect(totals.totalInspections).toBe(3);
    expect(totals.averageDurationHours).toBeCloseTo(36, 0);
    expect(totals.lastCompletedAt).toBe("2026-09-25T13:51:00.847Z");
  });

  it("uses the reported total even when only a slice is loaded", () => {
    const totals = summarizeWorkHistory([], 42);

    expect(totals.completedCount).toBe(42);
    expect(totals.totalInspections).toBeNull();
    expect(totals.averageDurationHours).toBeNull();
    expect(totals.lastCompletedAt).toBeNull();
  });

  it("refuses an inspection total when some entries are not hydrated", () => {
    const entries = [
      toWorkHistoryEntry(
        summary({ id: "a" }),
        details({
          closedAt: "2026-09-25T13:51:00.847Z",
          timeline: [event("Inspection Started", "2026-09-24T14:00:00.000Z")],
        }),
        ADJUSTER_ID,
      ),
      toWorkHistoryEntry(summary({ id: "b" }), null, ADJUSTER_ID),
    ];

    expect(summarizeWorkHistory(entries, 2).totalInspections).toBeNull();
  });
});
