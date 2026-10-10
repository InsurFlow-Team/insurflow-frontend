import { describe, expect, it } from "vitest";

import {
  SLA_RULES,
  SLA_RULE_KEYS,
  claimStaleThresholdDays,
  isSlaConfigured,
  slaRule,
  slaStateFor,
} from "./sla";

describe("sla", () => {
  it("ships exactly one live rule — the existing 3-day staleness rule", () => {
    expect(SLA_RULES.claimStale).toMatchObject({
      source: "frontend-display",
      enabled: true,
      durationDays: 3,
    });
    // Behaviour preservation: utils/attention.ts reads this, and the
    // dashboard has always flagged claims at 3 days.
    expect(claimStaleThresholdDays()).toBe(3);
  });

  it("declares the four product SLA rules as pending shape only", () => {
    const pending = [
      "adjusterAcceptance",
      "inspectionCompletion",
      "reportSubmission",
      "decision",
    ] as const;

    for (const key of pending) {
      const rule = slaRule(key);
      expect(rule.enabled).toBe(false);
      expect(rule.durationDays).toBeNull();
      expect(rule.source).toBe("backend-pending");
      expect(isSlaConfigured(key)).toBe(false);
    }

    expect(SLA_RULE_KEYS).toHaveLength(5);
    expect(isSlaConfigured("claimStale")).toBe(true);
  });

  it("never reports a breach for a rule that is not configured", () => {
    expect(slaStateFor("adjusterAcceptance", 999)).toBe("unknown");
    expect(slaStateFor("decision", 999)).toBe("unknown");
    expect(slaStateFor("claimStale", Number.NaN)).toBe("unknown");
  });

  it("evaluates the live rule at its threshold", () => {
    expect(slaStateFor("claimStale", 0)).toBe("ok");
    expect(slaStateFor("claimStale", 2)).toBe("ok");
    expect(slaStateFor("claimStale", 3)).toBe("breached");
    expect(slaStateFor("claimStale", 30)).toBe("breached");
  });

  it("keeps every rule labelled for i18n", () => {
    for (const key of SLA_RULE_KEYS) {
      expect(slaRule(key).labelKey).toBe(`sla.${key}`);
    }
  });
});
