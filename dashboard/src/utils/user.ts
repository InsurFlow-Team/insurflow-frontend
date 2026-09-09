import type { Role, User, UserStatus } from "../types";

const AVATAR_PALETTES = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

export const ROLE_OPTIONS: Array<{ value: Role; label: string }> = [
  { value: "ADMIN", label: "Admin" },
  { value: "CLAIMS_OFFICER", label: "Claims Officer" },
  { value: "FIELD_ADJUSTER", label: "Field Adjuster" },
];

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