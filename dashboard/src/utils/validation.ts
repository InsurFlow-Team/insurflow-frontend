export function validateRequired(value: string): string | null {
  if (!value.trim()) {
    return "This field is required";
  }

  return null;
}

export function validateName(value: string): string | null {
  const required = validateRequired(value);

  if (required) return required;

  if (value.trim().length < 2) return "Name must be at least 2 characters";

  return null;
}

export function validateEmployeeCode(value: string): string | null {
  const required = validateRequired(value);
  if (required) return required;

  return null;
}

export function validatePassword(value: string): string | null {
  const required = validateRequired(value);
  if (required) return required;

  if (value.length < 8) return "Password must be at least 8 characters";

  return null;
}

export function validateStatus(value: string): string | null {
  const required = validateRequired(value);
  if (required) return required;
  if (!["ACTIVE", "INACTIVE"].includes(value)) {
    return "Invalid status";
  }

  return null;
}

export function validateRole(value: string): string | null {
  const required = validateRequired(value);
  if (required) return required;
  if (!["ADMIN", "CLAIMS_OFFICER", "FIELD_ADJUSTER"].includes(value)) {
    return "Invalid role";
  }

  return null;
}

// ─── Claim form validation ────────────────────────────────────────────────────

export function validatePhone(value: string): string | null {
  const required = validateRequired(value);
  if (required) return required;

  const cleaned = value.replace(/[\s\-()]/g, "");
  if (!/^\d{10,}$/.test(cleaned)) {
    return "Phone number must contain at least 10 digits";
  }

  return null;
}

export function validatePlateNumber(value: string): string | null {
  const required = validateRequired(value);
  if (required) return required;

  if (value.trim().length < 3) {
    return "Plate number must be at least 3 characters";
  }

  return null;
}

// Normalizes a license plate input: Latin letters are uppercased while Arabic
// characters, Arabic-Indic digits, and Latin digits are preserved. Used by the
// controlled plate input so typing, editing, deleting, and pasting always agree
// on the same normalized value stored in form state.
export function normalizePlateNumber(value: string): string {
  return value.replace(/[a-z]/g, (char) => char.toUpperCase());
}

export function validateIncidentType(value: string): string | null {
  const required = validateRequired(value);
  if (required) return required;

  const validTypes = [
    "COLLISION",
    "REAR_END_COLLISION",
    "SIDE_IMPACT",
    "PARKING_DAMAGE",
    "OTHER",
  ];
  if (!validTypes.includes(value)) {
    return "Please select a valid incident type";
  }

  return null;
}

export function validatePriority(value: string): string | null {
  const required = validateRequired(value);
  if (required) return required;

  if (!["LOW", "MEDIUM", "HIGH"].includes(value)) {
    return "Please select a valid priority";
  }

  return null;
}

export function validateDescription(value: string, minLength = 10): string | null {
  const required = validateRequired(value);
  if (required) return required;

  if (value.trim().length < minLength) {
    return `Description must be at least ${minLength} characters`;
  }

  return null;
}

export function validateCoordinate(value: string, type: "latitude" | "longitude"): string | null {
  if (!value.trim()) return null; // Optional field

  const num = Number(value);
  if (isNaN(num)) {
    return `${type === "latitude" ? "Latitude" : "Longitude"} must be a valid number`;
  }

  if (type === "latitude" && (num < -90 || num > 90)) {
    return "Latitude must be between -90 and 90";
  }

  if (type === "longitude" && (num < -180 || num > 180)) {
    return "Longitude must be between -180 and 180";
  }

  return null;
}
