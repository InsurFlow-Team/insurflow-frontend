import { describe, expect, it } from "vitest";
import {
  normalizePlateNumber,
  validateCoordinate,
  validateDescription,
  validateIncidentType,
  validatePhone,
  validatePlateNumber,
  validatePriority,
  validateRequired,
} from "./validation";

describe("validateRequired", () => {
  it("rejects empty and whitespace-only values", () => {
    expect(validateRequired("")).toBe("This field is required");
    expect(validateRequired("   ")).toBe("This field is required");
  });

  it("accepts non-empty values", () => {
    expect(validateRequired("Ahmed")).toBeNull();
  });
});

describe("validatePhone", () => {
  it("rejects missing values", () => {
    expect(validatePhone("")).toBe("This field is required");
  });

  it("rejects numbers with fewer than 10 digits", () => {
    expect(validatePhone("05012345")).toBe(
      "Phone number must contain at least 10 digits",
    );
  });

  it("accepts national Saudi-style phone numbers with separators", () => {
    expect(validatePhone("05 123 456 789")).toBeNull();
    expect(validatePhone("(05) 123-456-789")).toBeNull();
    expect(validatePhone("0512345678")).toBeNull();
  });

  it("rejects international format with a leading + (not supported)", () => {
    // Documented placeholder is the national format "05XXXXXXXX"
    expect(validatePhone("+966512345678")).toBe(
      "Phone number must contain at least 10 digits",
    );
  });
});

describe("validatePlateNumber", () => {
  it("rejects empty values", () => {
    expect(validatePlateNumber("")).toBe("This field is required");
  });

  it("rejects values shorter than 3 characters", () => {
    expect(validatePlateNumber("AB")).toBe(
      "Plate number must be at least 3 characters",
    );
  });

  it("accepts values of 3+ characters", () => {
    expect(validatePlateNumber("ABC-1234")).toBeNull();
    expect(validatePlateNumber("١٢٣")).toBeNull();
  });
});

describe("validateIncidentType", () => {
  it("rejects empty values", () => {
    expect(validateIncidentType("")).toBe("This field is required");
  });

  it("rejects unknown incident types", () => {
    expect(validateIncidentType("EXPLOSION")).toBe(
      "Please select a valid incident type",
    );
  });

  it("accepts all supported incident types", () => {
    for (const type of [
      "COLLISION",
      "REAR_END_COLLISION",
      "SIDE_IMPACT",
      "PARKING_DAMAGE",
      "OTHER",
    ]) {
      expect(validateIncidentType(type)).toBeNull();
    }
  });
});

describe("validateDescription", () => {
  it("rejects empty values", () => {
    expect(validateDescription("", 20)).toBe("This field is required");
  });

  it("enforces the minimum length", () => {
    expect(validateDescription("too short", 20)).toBe(
      "Description must be at least 20 characters",
    );
    expect(validateDescription("short description", 10)).toBeNull();
  });
});

describe("validateCoordinate", () => {
  it("treats empty values as valid (optional field)", () => {
    expect(validateCoordinate("", "latitude")).toBeNull();
    expect(validateCoordinate("", "longitude")).toBeNull();
  });

  it("rejects non-numeric values", () => {
    expect(validateCoordinate("abc", "latitude")).toBe(
      "Latitude must be a valid number",
    );
    expect(validateCoordinate("abc", "longitude")).toBe(
      "Longitude must be a valid number",
    );
  });

  it("validates latitude range", () => {
    expect(validateCoordinate("91", "latitude")).toBe(
      "Latitude must be between -90 and 90",
    );
    expect(validateCoordinate("-91", "latitude")).toBe(
      "Latitude must be between -90 and 90",
    );
    expect(validateCoordinate("24.7136", "latitude")).toBeNull();
  });

  it("validates longitude range", () => {
    expect(validateCoordinate("181", "longitude")).toBe(
      "Longitude must be between -180 and 180",
    );
    expect(validateCoordinate("-181", "longitude")).toBe(
      "Longitude must be between -180 and 180",
    );
    expect(validateCoordinate("46.6753", "longitude")).toBeNull();
  });
});

describe("validatePriority", () => {
  it("rejects empty values", () => {
    expect(validatePriority("")).toBe("This field is required");
  });

  it("rejects unknown priorities", () => {
    expect(validatePriority("URGENT")).toBe("Please select a valid priority");
  });

  it("accepts LOW, MEDIUM and HIGH", () => {
    expect(validatePriority("LOW")).toBeNull();
    expect(validatePriority("MEDIUM")).toBeNull();
    expect(validatePriority("HIGH")).toBeNull();
  });
});

describe("normalizePlateNumber", () => {
  it("uppercases Latin letters (typing)", () => {
    expect(normalizePlateNumber("abc-1234")).toBe("ABC-1234");
    expect(normalizePlateNumber("ABC-1234")).toBe("ABC-1234");
  });

  it("preserves Arabic words and Arabic-Indic digits (e.g. ١٢٣٤ أ ب ج)", () => {
    expect(normalizePlateNumber("١٢٣٤ أ ب ج")).toBe("١٢٣٤ أ ب ج");
  });

  it("supports character-by-character editing and deleting", () => {
    expect(normalizePlateNumber("a")).toBe("A");
    expect(normalizePlateNumber("ab")).toBe("AB");
    expect(normalizePlateNumber("A")).toBe("A");
    expect(normalizePlateNumber("")).toBe("");
    expect(normalizePlateNumber("AbC123")).toBe("ABC123");
  });

  it("handles pasted mixed-case plate values", () => {
    expect(normalizePlateNumber("tOyOtA-2026")).toBe("TOYOTA-2026");
    expect(normalizePlateNumber("lnx-٤٥٦")).toBe("LNX-٤٥٦");
  });
});