import { describe, expect, it } from "vitest";
import {
  formatAbsoluteTime,
  formatRelativeTime,
} from "./relativeTime";

const NOW = new Date("2026-09-27T12:00:00.000Z").getTime();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

function ago(ms: number) {
  return new Date(NOW - ms).toISOString();
}

describe("formatRelativeTime", () => {
  it("calls anything under a minute 'just now'", () => {
    expect(formatRelativeTime(ago(0), NOW)).toBe("just now");
    expect(formatRelativeTime(ago(59_000), NOW)).toBe("just now");
  });

  it("counts minutes below an hour", () => {
    expect(formatRelativeTime(ago(MINUTE), NOW)).toBe("1m ago");
    expect(formatRelativeTime(ago(59 * MINUTE), NOW)).toBe("59m ago");
  });

  it("counts hours below a day", () => {
    expect(formatRelativeTime(ago(HOUR), NOW)).toBe("1h ago");
    expect(formatRelativeTime(ago(23 * HOUR), NOW)).toBe("23h ago");
  });

  it("counts days below a week", () => {
    expect(formatRelativeTime(ago(DAY), NOW)).toBe("1d ago");
    expect(formatRelativeTime(ago(6 * DAY), NOW)).toBe("6d ago");
  });

  it("falls back to an absolute date at a week and beyond", () => {
    // 2026-09-20, seven days back
    expect(formatRelativeTime(ago(WEEK), NOW)).toBe("Sep 20");
    expect(formatRelativeTime(ago(90 * DAY), NOW)).toBe("Jun 29");
  });

  it("does not render a future timestamp as zero minutes ago", () => {
    const future = new Date(NOW + 2 * HOUR).toISOString();
    expect(formatRelativeTime(future, NOW)).toBe("Sep 27");
  });

  it("returns an empty string for an unusable value", () => {
    expect(formatRelativeTime("not-a-date", NOW)).toBe("");
    expect(formatRelativeTime("", NOW)).toBe("");
  });

  it("uses local calendar days, so it matches what the user sees", () => {
    // Built with local-time components to stay independent of the runner's zone.
    const local = new Date(2026, 8, 20, 9, 0, 0);
    expect(formatRelativeTime(local.toISOString(), NOW)).toBe("Sep 20");
  });
});

describe("formatAbsoluteTime", () => {
  it("renders a zero-padded 24-hour time with the date", () => {
    const local = new Date(2026, 8, 27, 3, 2, 0);
    expect(formatAbsoluteTime(local.toISOString())).toBe("Sep 27, 03:02");
  });

  it("returns an empty string for an unusable value", () => {
    expect(formatAbsoluteTime("nope")).toBe("");
  });
});
