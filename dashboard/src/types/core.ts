// Core enums / primitives shared across Masar domains.

export type Role = "ADMIN" | "CLAIMS_OFFICER" | "FIELD_ADJUSTER";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type ClaimStatus =
  | "NEW"
  | "PENDING_ACCEPTANCE"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CORRECTION_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "CLOSED";

export type ClaimPriority = "LOW" | "MEDIUM" | "HIGH";

export type InspectionTaskStatus = "ASSIGNED" | "IN_PROGRESS" | "SUBMITTED";

export type Availability = "AVAILABLE" | "UNAVAILABLE";

export interface GeoPoint {
  latitude?: number | null;
  longitude?: number | null;
  capturedAt?: string | null;
}