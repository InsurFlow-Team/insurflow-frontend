export type Role = "ADMIN" | "CLAIMS_OFFICER" | "FIELD_ADJUSTER";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type ClaimStatus = "SUBMITTED" | "UNDER_REVIEW" | "CLOSED";

export type InspectionTaskStatus = "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED";

export type Availability = "AVAILABLE" | "UNAVAILABLE";

export interface Organization {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  employeeCode: string;
  role: Role;
  status: UserStatus;
  organization: Organization;
}

export interface FieldAdjuster extends User {
  activeTasksCount: number;
  availability: Availability;
}

export interface Claim {
  id: string;
  claimNumber: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}
