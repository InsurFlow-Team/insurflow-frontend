import type { User } from "../../types";
import { getUserStatus } from "../../utils/user";

export function computeUserStats(users: User[]) {
  const active = users.filter(
    (user) => getUserStatus(user) === "ACTIVE",
  ).length;

  return {
    total: users.length,
    active,
    inactive: users.length - active,
    admins: users.filter((user) => user.role === "ADMIN").length,
    claimsOfficers: users.filter((user) => user.role === "CLAIMS_OFFICER")
      .length,
    fieldAdjusters: users.filter((user) => user.role === "FIELD_ADJUSTER")
      .length,
  };
}