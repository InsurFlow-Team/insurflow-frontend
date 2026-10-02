import type {
  Availability,
  GeoPoint,
  Role,
  UserStatus,
} from "./core";

export type CreateUserRequest = {
  name: string;
  employeeCode: string;
  password: string;
  role: "CLAIMS_OFFICER" | "FIELD_ADJUSTER";
};

export interface User {
  id: string;
  name: string;
  employeeCode: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  status?: UserStatus;
}

export interface FieldAdjuster extends User {
  status: UserStatus;
  activeTasksCount: number;
  availability: Availability;
  capacityLimit?: number | null;
  location?: GeoPoint | null;
  distanceKm?: number | null;
}

export interface UserSummary {
  id: string;
  name: string | null;
  employeeCode: string | null;
  role?: string;
}