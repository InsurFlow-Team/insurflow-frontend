import { describe, expect, it } from "vitest";

import { ar } from "./messages.ar";
import { en, type MessageKey } from "./messages.en";
import { LOCALES, MESSAGES, createTranslator, isLocale, translate } from "./index";
import { CLAIM_STAGES } from "../domain/claimLifecycle";
import { ASSIGNMENT_STAGES } from "../domain/assignmentLifecycle";
import { CLAIM_ACTIONS, CLAIM_ACTION_KEYS } from "../domain/actions";
import { SLA_RULE_KEYS } from "../domain/sla";
import { ROLE_NAVIGATION } from "../navigation/roleNavigation";
import { ALL_CLAIM_STATUSES } from "../utils/claims";

const enKeys = Object.keys(en).sort();
const arKeys = Object.keys(ar).sort();

describe("i18n dictionaries", () => {
  it("keeps English and Arabic in lockstep", () => {
    expect(arKeys).toEqual(enKeys);
    expect(LOCALES).toEqual(["en", "ar"]);
    expect(Object.keys(MESSAGES)).toHaveLength(2);
  });

  it("has no blank or placeholder strings", () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(MESSAGES[locale])) {
        expect(value, `${locale}.${key}`).toBeTruthy();
        expect(value.trim(), `${locale}.${key}`).toBe(value);
      }
    }
  });

  it("labels every backend claim status", () => {
    for (const status of ALL_CLAIM_STATUSES) {
      for (const locale of LOCALES) {
        expect(MESSAGES[locale][`claimStatus.${status}` as MessageKey]).toBeTruthy();
      }
    }
  });

  it("resolves every labelKey used by the domain and navigation layers", () => {
    const usedKeys: string[] = [
      ...CLAIM_STAGES.map((s) => s.labelKey),
      ...ASSIGNMENT_STAGES.map((s) => s.labelKey),
      ...CLAIM_ACTION_KEYS.map((k) => CLAIM_ACTIONS[k].labelKey),
      ...SLA_RULE_KEYS.map((k) => `sla.${k}`),
      ...ROLE_NAVIGATION.map((i) => i.labelKey),
    ];

    expect(usedKeys.length).toBeGreaterThan(40);
    for (const key of usedKeys) {
      for (const locale of LOCALES) {
        expect(
          MESSAGES[locale][key as MessageKey],
          `${locale} missing "${key}"`,
        ).toBeTruthy();
      }
    }
  });
});

describe("translate", () => {
  it("returns the locale string", () => {
    expect(translate("en", "action.ASSIGN_ADJUSTER")).toBe("Assign Adjuster");
    expect(translate("ar", "action.ASSIGN_ADJUSTER")).toBe("إسناد معاين");
    expect(translate("ar", "nav.overview")).toBe("نظرة عامة");
  });

  it("fails visibly instead of silently when a key is unknown", () => {
    const unknown = "claimStage.NOT_A_STAGE" as MessageKey;
    expect(translate("en", unknown)).toBe(unknown);
  });

  it("interpolates variables when present", () => {
    expect(createTranslator("en")("claimStatus.NEW", { unused: 1 })).toBe("New");
  });

  it("recognises valid locales only", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("EN")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
