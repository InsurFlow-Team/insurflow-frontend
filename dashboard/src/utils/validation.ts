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
