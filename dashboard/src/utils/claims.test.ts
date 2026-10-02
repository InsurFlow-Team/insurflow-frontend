import { describe, expect, it } from "vitest";
import { accidentTypeLabel } from "./claims";

describe("accidentTypeLabel", () => {
  it("translates every backend accidentType enum value to Arabic", () => {
    expect(accidentTypeLabel("COLLISION")).toBe("تصادم");
    expect(accidentTypeLabel("REAR_END_COLLISION")).toBe("تصادم خلفي");
    expect(accidentTypeLabel("SIDE_IMPACT")).toBe("اصطدام جانبي");
    expect(accidentTypeLabel("PARKING_DAMAGE")).toBe("أضرار أثناء الوقوف");
    expect(accidentTypeLabel("OTHER")).toBe("أخرى");
  });

  it("returns — for an empty value instead of undefined or null", () => {
    expect(accidentTypeLabel(null)).toBe("—");
    expect(accidentTypeLabel(undefined)).toBe("—");
    expect(accidentTypeLabel("")).toBe("—");
  });

  it("passes through an unknown value rather than hiding it", () => {
    expect(accidentTypeLabel("SOMETHING_NEW")).toBe("SOMETHING_NEW");
  });
});