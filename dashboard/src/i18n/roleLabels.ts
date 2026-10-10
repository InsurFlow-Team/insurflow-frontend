import type { MessageKey } from "./messages.en";
import type { Role } from "../types";

const ROLE_LABEL_KEYS: Record<Role, MessageKey> = {
  ADMIN: "role.admin",
  CLAIMS_OFFICER: "role.claimsOfficer",
  FIELD_ADJUSTER: "role.fieldAdjuster",
};

export function roleLabelKey(role: Role): MessageKey {
  return ROLE_LABEL_KEYS[role];
}
