import { describe, expect, it } from "vitest";
import { getTimelineEventView } from "./timeline";

describe("getTimelineEventView", () => {
  it("defaults a missing action label but keeps a real one", () => {
    expect(getTimelineEventView({}).action).toBe("Unknown action");
    expect(
      getTimelineEventView({ action: "Claim assigned" }).action,
    ).toBe("Claim assigned");
  });

  it("marks a decline when the event action says so", () => {
    expect(
      getTimelineEventView({
        action: "Claim assignment declined by the field adjuster",
      }).isDecline,
    ).toBe(true);
  });

  it("marks a decline when the reason text says so (English and Arabic)", () => {
    expect(
      getTimelineEventView({
        action: "Assignment rejected",
        reason: "Adjuster too far from the incident location",
      }).isDecline,
    ).toBe(true);

    expect(
      getTimelineEventView({
        action: "تم الرفض",
        notes: "المعاين مشغول خارج المدينة",
      }).isDecline,
    ).toBe(true);
  });

  it("does not flag ordinary assignment or acceptance events as declines", () => {
    expect(
      getTimelineEventView({
        action: "Assignment pending acceptance",
      }).isDecline,
    ).toBe(false);

    expect(
      getTimelineEventView({
        action: "Claim accepted by the field adjuster",
      }).isDecline,
    ).toBe(false);

    expect(
      getTimelineEventView({
        action: "[CAPACITY OVERRIDE] Assigned while adjuster had 4 active tasks (max: 3)",
      }).isDecline,
    ).toBe(false);
  });

  it("collects every non-empty detail field in display order", () => {
    const view = getTimelineEventView({
      action: "Claim assignment declined",
      reason: "Adjuster too far away",
      notes: "Suggests reassigning to the Jeddah team",
      message: "",
    });

    expect(view.details).toEqual([
      { label: "Notes", value: "Suggests reassigning to the Jeddah team" },
      { label: "Reason", value: "Adjuster too far away" },
    ]);
  });
});