import type { Role, User, UserStatus } from "../types";

const AVATAR_PALETTES = [
  "bg-info-soft text-info-text",
  "bg-violet-soft text-violet-text",
  "bg-success-soft text-success-text",
  "bg-accent-light text-warning-text",
  "bg-rose-soft text-rose-text",
  "bg-violet-soft text-violet-text",
];

export const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "ADMIN", label: "Admin" },
  { value: "CLAIMS_OFFICER", label: "Claims Officer" },
  { value: "FIELD_ADJUSTER", label: "Field Adjuster" },
];

// POST /users rejects ADMIN ("role must be one of [CLAIMS_OFFICER,
// FIELD_ADJUSTER]"), so the Create User form must not offer it.
export const CREATE_ROLE_OPTIONS = ROLE_OPTIONS.filter(
  (option) => option.value !== "ADMIN",
);

export const STATUS_OPTIONS: Array<{ value: UserStatus; label: string }> = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

export function userInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

export function avatarClasses(name: string) {
  let sum = 0;
  for (const char of name) sum += char.charCodeAt(0);
  return AVATAR_PALETTES[sum % AVATAR_PALETTES.length];
}

// TEMPORARY: the backend does not return an email yet. Deterministic placeholder
// until a real email field is added to the User API. Replace temporaryUserEmail()
// usage with the real field when available.
export function temporaryUserEmail(user: User) {
  return `${user.employeeCode.toLowerCase()}@insurflow.io`;
}

export function getUserStatus(user: User): UserStatus {
  // The backend provides status in practice; ACTIVE fallback keeps the UI safe
  // for any user object missing it.
  return user.status ?? "ACTIVE";
}